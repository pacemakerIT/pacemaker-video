import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MCP_MAIN_VISUAL_READ_SCOPE,
  signMcpApiAccessToken,
  verifyMcpApiAccessToken
} from '@/lib/mcp-api-token';
import { getMcpOAuthClientId, getMcpTokenSettings } from '@/lib/mcp-settings';

const MCP_ENV_KEYS = [
  'MCP_API_JWT_ISSUER',
  'MCP_API_JWT_AUDIENCE',
  'MCP_API_JWT_KEY_ID',
  'MCP_API_JWT_PRIVATE_KEY',
  'MCP_API_JWT_PUBLIC_KEY',
  'MCP_OAUTH_CLIENT_ID'
];

describe('MCP settings', () => {
  beforeEach(() => {
    for (const key of MCP_ENV_KEYS) vi.stubEnv(key, '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('works without MCP_* variables in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(getMcpOAuthClientId()).toBe('fJkMj3Mil3vjq9So');
    const token = await signMcpApiAccessToken({
      subject: 'user_admin',
      clientId: 'fJkMj3Mil3vjq9So',
      scopes: [MCP_MAIN_VISUAL_READ_SCOPE]
    });
    await expect(
      verifyMcpApiAccessToken(token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).resolves.toMatchObject({ subject: 'user_admin' });
  });

  it('keeps one development key pair across calls', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(getMcpTokenSettings().publicKeyPem).toBe(
      getMcpTokenSettings().publicKeyPem
    );
  });

  it('prefers explicit variables over development defaults', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MCP_OAUTH_CLIENT_ID', 'configured-client');
    vi.stubEnv('MCP_API_JWT_ISSUER', 'https://api.pacemaker.test');

    expect(getMcpOAuthClientId()).toBe('configured-client');
    expect(getMcpTokenSettings().issuer).toBe('https://api.pacemaker.test');
  });

  it('does not generate a key pair when only one key is set', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MCP_API_JWT_PUBLIC_KEY', 'configured-public-key');

    expect(() => getMcpTokenSettings()).toThrow(/incomplete/);
  });

  for (const nodeEnv of ['production', 'test']) {
    it(`uses no defaults when NODE_ENV is ${nodeEnv}`, () => {
      vi.stubEnv('NODE_ENV', nodeEnv);

      expect(getMcpOAuthClientId()).toBeUndefined();
      expect(() => getMcpTokenSettings()).toThrow(/incomplete/);
    });
  }
});
