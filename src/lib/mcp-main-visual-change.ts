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

// Control characters, line/paragraph separators and invisible formatting
// characters such as bidi overrides and zero-width spaces. The zero-width
// joiner stays allowed because joined emoji need it. Newlines are allowed only
// in the title (the home page breaks it there).
const HIDDEN_CHARACTERS = /[\p{Cc}\p{Zl}\p{Zp}]|(?!\u200D)\p{Cf}/u;
// Characters RFC 3986 allows in a path, query and fragment. Anything else,
// such as quotes, angle brackets or non-ASCII text, must be percent-encoded.
const SITE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@\/?#[\]%]*$/;
const INVALID_PERCENT_ESCAPE = /%(?![0-9A-Fa-f]{2})/;
const LINK_BASE = 'https://pacemaker.invalid';

function optionalSingleLine(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .refine(
      (value) => !HIDDEN_CHARACTERS.test(value),
      `${label} must be a single line without control or invisible characters.`
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
        (value) => !HIDDEN_CHARACTERS.test(value.replaceAll('\n', '')),
        'Title must not contain control or invisible characters.'
      )
      .refine(
        (value) => value.split('\n').length <= 3,
        'Title must be 3 lines or fewer.'
      )
  );

// Only paths on this site, so a change cannot send home page visitors to
// another origin.
function isSitePath(value: string) {
  if (!SITE_PATH.test(value) || INVALID_PERCENT_ESCAPE.test(value)) {
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
    'Link must be a path on this site that starts with "/", for example /courses. Percent-encode spaces, quotes and non-ASCII characters.'
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

export type MainVisualPreviewClaims = {
  mainVisualId: string;
  changes: MainVisualChanges;
  baseUpdatedAt: string;
};

export type MainVisualChangeClaims = MainVisualPreviewClaims & {
  subject: string;
  clientId: string;
};

const previewTokenPayloadSchema = z.object({
  mvid: z.uuid(),
  changes: mainVisualChangesSchema,
  base: z.iso.datetime(),
  jti: z.string().min(1)
});

const changeTokenPayloadSchema = previewTokenPayloadSchema.extend({
  sub: z.string().min(1),
  client_id: z.string().min(1)
});

// Signed with the MCP API key but a different `typ`, so a change token is
// never accepted as an API access token, and a preview token never applies.
// The preview token travels in a browser URL (history, sign-in redirect), so
// it leaves out who proposed the change.
export async function signMainVisualChangeToken(
  kind: MainVisualChangeTokenKind,
  claims: MainVisualChangeClaims
): Promise<{ token: string; expiresAt: Date }> {
  const settings = getMcpTokenSettings();
  const privateKey = await importPKCS8(settings.privateKeyPem, 'RS256');
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + MAIN_VISUAL_CHANGE_TTL_SECONDS;

  const jwt = new SignJWT({
    ...(kind === 'apply' ? { client_id: claims.clientId } : {}),
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
    .setAudience(settings.audience)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .setJti(randomUUID());
  if (kind === 'apply') {
    jwt.setSubject(claims.subject);
  }
  const token = await jwt.sign(privateKey);

  return { token, expiresAt: new Date(expiresAt * 1000) };
}

export async function verifyMainVisualChangeToken(
  token: string,
  kind: 'apply'
): Promise<MainVisualChangeClaims>;
export async function verifyMainVisualChangeToken(
  token: string,
  kind: 'preview'
): Promise<MainVisualPreviewClaims>;
export async function verifyMainVisualChangeToken(
  token: string,
  kind: MainVisualChangeTokenKind
): Promise<MainVisualChangeClaims | MainVisualPreviewClaims> {
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

  if (kind === 'preview') {
    const parsed = previewTokenPayloadSchema.parse(payload);
    return {
      mainVisualId: parsed.mvid,
      changes: parsed.changes,
      baseUpdatedAt: parsed.base
    };
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
