import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  MCP_MAIN_VISUAL_READ_SCOPE,
  verifyMcpApiAccessToken
} from '@/lib/mcp-api-token';
import {
  describeChangeErrors,
  diffMainVisual,
  findChangeConflict,
  mainVisualChangesSchema,
  signMainVisualChangeToken,
  verifyMainVisualChangeToken,
  type EditableMainVisual
} from '@/lib/mcp-main-visual-change';

const CURRENT: EditableMainVisual = {
  title: 'Mock interviews\nwith local mentors',
  description: 'Honest feedback.',
  linkName: 'Join Workshop',
  link: '/workshops',
  isPublic: true
};

const CLAIMS = {
  subject: 'user_admin',
  clientId: 'approved-client',
  mainVisualId: '0b9f8a52-3c4d-4e5f-8a6b-7c8d9e0f1a2b',
  changes: { title: 'New title' },
  baseUpdatedAt: '2026-11-03T15:24:04.757Z'
};

function parse(input: unknown) {
  return mainVisualChangesSchema.safeParse(input);
}

describe('main visual change validation', () => {
  it('normalizes text and turns empty optional values into null', () => {
    const result = parse({
      title: '  Line one\r\nLine two  ',
      description: '',
      linkName: ' Go ',
      link: ' /courses?level=1 ',
      isPublic: false
    });

    expect(result.success && result.data).toEqual({
      title: 'Line one\nLine two',
      description: null,
      linkName: 'Go',
      link: '/courses?level=1',
      isPublic: false
    });
  });

  it.each([
    [{ title: '' }, 'Title is required.'],
    [{ title: 'a'.repeat(121) }, '120 characters'],
    [{ title: 'one\ntwo\nthree\nfour' }, '3 lines'],
    [{ title: 'tab\there' }, 'control characters'],
    [{ description: 'two\nlines' }, 'single line'],
    [{ linkName: 'a'.repeat(41) }, '40 characters']
  ])('rejects invalid text %j', (input, message) => {
    const result = parse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(describeChangeErrors(result.error)).toContain(message);
    }
  });

  it.each([
    'https://example.com',
    '//example.com/path',
    'courses',
    '/\\example.com',
    '/with space',
    'javascript:alert(1)'
  ])('rejects link %s', (link) => {
    expect(parse({ link }).success).toBe(false);
  });

  it('rejects unknown fields and empty changes', () => {
    const unknown = parse({ thumbnail: '/x.png' });
    expect(unknown.success).toBe(false);
    if (!unknown.success) {
      expect(describeChangeErrors(unknown.error)).toContain(
        'Only title, description, linkName, link, isPublic can be changed.'
      );
    }
    expect(parse({}).success).toBe(false);
  });
});

describe('diffMainVisual', () => {
  it('keeps only fields whose value changes', () => {
    expect(
      diffMainVisual(CURRENT, {
        title: CURRENT.title,
        linkName: 'Sign up',
        isPublic: false
      })
    ).toEqual({
      before: { linkName: 'Join Workshop', isPublic: true },
      after: { linkName: 'Sign up', isPublic: false }
    });
  });

  it('requires button text while a link remains', () => {
    expect(findChangeConflict(CURRENT, { linkName: null })).toMatch(
      /Button text is required/
    );
    expect(findChangeConflict(CURRENT, { linkName: null, link: null })).toBe(
      null
    );
  });
});

describe('main visual change tokens', () => {
  beforeAll(() => {
    vi.stubEnv('NODE_ENV', 'development');
    for (const key of [
      'MCP_API_JWT_ISSUER',
      'MCP_API_JWT_AUDIENCE',
      'MCP_API_JWT_KEY_ID',
      'MCP_API_JWT_PRIVATE_KEY',
      'MCP_API_JWT_PUBLIC_KEY',
      'MCP_OAUTH_CLIENT_ID'
    ]) {
      vi.stubEnv(key, '');
    }
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('round-trips the previewed change', async () => {
    const { token, expiresAt } = await signMainVisualChangeToken(
      'apply',
      CLAIMS
    );

    await expect(verifyMainVisualChangeToken(token, 'apply')).resolves.toEqual(
      CLAIMS
    );
    expect(expiresAt.getTime() - Date.now()).toBeGreaterThan(590_000);
  });

  it('keeps apply, preview and API tokens apart', async () => {
    const preview = await signMainVisualChangeToken('preview', CLAIMS);
    const apply = await signMainVisualChangeToken('apply', CLAIMS);

    await expect(
      verifyMainVisualChangeToken(preview.token, 'apply')
    ).rejects.toThrow();
    await expect(
      verifyMainVisualChangeToken(apply.token, 'preview')
    ).rejects.toThrow();
    await expect(
      verifyMcpApiAccessToken(apply.token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).rejects.toThrow();
  });

  it('rejects an expired change token', async () => {
    const { token } = await signMainVisualChangeToken('apply', CLAIMS);
    vi.useFakeTimers({ now: Date.now() + 11 * 60_000 });

    await expect(verifyMainVisualChangeToken(token, 'apply')).rejects.toThrow();
    vi.useRealTimers();
  });
});
