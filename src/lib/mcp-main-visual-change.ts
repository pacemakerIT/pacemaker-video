import { randomUUID } from 'node:crypto';
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';
import { getMcpTokenSettings } from '@/lib/mcp-settings';

export const MAIN_VISUAL_CHANGE_TTL_SECONDS = 600;

export const EDITABLE_MAIN_VISUAL_FIELDS = [
  'title',
  'description',
  'linkName',
  'link',
  'isPublic'
] as const;

export type EditableMainVisualField =
  (typeof EDITABLE_MAIN_VISUAL_FIELDS)[number];

export type EditableMainVisual = {
  title: string;
  description: string | null;
  linkName: string | null;
  link: string | null;
  isPublic: boolean;
};

export type MainVisualChanges = Partial<EditableMainVisual>;

// Newlines are allowed only in the title (the home page breaks it there).
const CONTROL_CHARACTERS = /[\u0000-\u0009\u000B-\u001F\u007F]/;
const LINE_BREAK = /[\r\n]/;
const LINK_BASE = 'https://pacemaker.invalid';

function optionalSingleLine(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .refine(
      (value) => !CONTROL_CHARACTERS.test(value) && !LINE_BREAK.test(value),
      `${label} must be a single line without control characters.`
    )
    .transform((value) => (value === '' ? null : value))
    .nullable();
}

const titleSchema = z
  .string()
  .transform((value) => value.replace(/\r\n?/g, '\n').trim())
  .pipe(
    z
      .string()
      .min(1, 'Title is required.')
      .max(120, 'Title must be 120 characters or fewer.')
      .refine(
        (value) => !CONTROL_CHARACTERS.test(value),
        'Title must not contain control characters.'
      )
      .refine(
        (value) => value.split('\n').length <= 3,
        'Title must be 3 lines or fewer.'
      )
  );

// Only paths on this site, so a change cannot send home page visitors to
// another origin.
function isSitePath(value: string) {
  if (!/^\/(?!\/)[^\s\\]*$/.test(value) || CONTROL_CHARACTERS.test(value)) {
    return false;
  }
  try {
    return new URL(value, LINK_BASE).origin === LINK_BASE;
  } catch {
    return false;
  }
}

const linkSchema = z
  .string()
  .trim()
  .max(200, 'Link must be 200 characters or fewer.')
  .refine(
    (value) => value === '' || isSitePath(value),
    'Link must be a path on this site that starts with "/", for example /courses.'
  )
  .transform((value) => (value === '' ? null : value))
  .nullable();

export const mainVisualChangesSchema = z
  .strictObject({
    title: titleSchema.optional(),
    description: optionalSingleLine('Description', 300).optional(),
    linkName: optionalSingleLine('Button text', 40).optional(),
    link: linkSchema.optional(),
    isPublic: z.boolean().optional()
  })
  .refine(
    (changes) => Object.keys(changes).length > 0,
    'Provide at least one field to change.'
  );

export function describeChangeErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) =>
      issue.code === 'unrecognized_keys'
        ? `Only ${EDITABLE_MAIN_VISUAL_FIELDS.join(', ')} can be changed.`
        : issue.message
    )
    .join(' ');
}

export type MainVisualDiff = {
  before: MainVisualChanges;
  after: MainVisualChanges;
};

// Keeps only the fields whose value actually changes.
export function diffMainVisual(
  current: EditableMainVisual,
  changes: MainVisualChanges
): MainVisualDiff {
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};

  for (const field of EDITABLE_MAIN_VISUAL_FIELDS) {
    if (field in changes && changes[field] !== current[field]) {
      before[field] = current[field];
      after[field] = changes[field];
    }
  }

  return {
    before: before as MainVisualChanges,
    after: after as MainVisualChanges
  };
}

// The home page shows the button only with both a label and a link.
export function findChangeConflict(
  current: EditableMainVisual,
  after: MainVisualChanges
): string | null {
  const merged = { ...current, ...after };
  if (merged.link && !merged.linkName) {
    return 'Button text is required when the banner has a link.';
  }
  return null;
}

export type MainVisualChangeTokenKind = 'apply' | 'preview';

const TOKEN_TYPES: Record<MainVisualChangeTokenKind, string> = {
  apply: 'mcp-change+jwt',
  preview: 'mcp-preview+jwt'
};

export type MainVisualChangeClaims = {
  subject: string;
  clientId: string;
  mainVisualId: string;
  changes: MainVisualChanges;
  baseUpdatedAt: string;
};

const changeTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  client_id: z.string().min(1),
  mvid: z.uuid(),
  changes: mainVisualChangesSchema,
  base: z.iso.datetime(),
  jti: z.string().min(1)
});

// Signed with the MCP API key but a different `typ`, so a change token is
// never accepted as an API access token, and a preview token never applies.
export async function signMainVisualChangeToken(
  kind: MainVisualChangeTokenKind,
  claims: MainVisualChangeClaims
): Promise<{ token: string; expiresAt: Date }> {
  const settings = getMcpTokenSettings();
  const privateKey = await importPKCS8(settings.privateKeyPem, 'RS256');
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + MAIN_VISUAL_CHANGE_TTL_SECONDS;

  const token = await new SignJWT({
    client_id: claims.clientId,
    mvid: claims.mainVisualId,
    changes: claims.changes,
    base: claims.baseUpdatedAt
  })
    .setProtectedHeader({
      alg: 'RS256',
      typ: TOKEN_TYPES[kind],
      kid: settings.keyId
    })
    .setIssuer(settings.issuer)
    .setSubject(claims.subject)
    .setAudience(settings.audience)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .setJti(randomUUID())
    .sign(privateKey);

  return { token, expiresAt: new Date(expiresAt * 1000) };
}

export async function verifyMainVisualChangeToken(
  token: string,
  kind: MainVisualChangeTokenKind
): Promise<MainVisualChangeClaims> {
  const settings = getMcpTokenSettings();
  const publicKey = await importSPKI(settings.publicKeyPem, 'RS256');
  const { payload, protectedHeader } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: settings.issuer,
    audience: settings.audience,
    typ: TOKEN_TYPES[kind],
    maxTokenAge: `${MAIN_VISUAL_CHANGE_TTL_SECONDS}s`,
    clockTolerance: 5
  });

  if (protectedHeader.kid !== settings.keyId) {
    throw new Error('Invalid change token signing key identifier.');
  }

  const parsed = changeTokenPayloadSchema.parse(payload);
  return {
    subject: parsed.sub,
    clientId: parsed.client_id,
    mainVisualId: parsed.mvid,
    changes: parsed.changes,
    baseUpdatedAt: parsed.base
  };
}
