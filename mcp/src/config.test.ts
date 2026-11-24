import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ConfigError,
  hostIdFromClientName,
  loadConfig,
  redirectUriFor
} from './config.ts';

const BASE_ENV = {
  PACEMAKER_MCP_CLERK_ISSUER: 'https://example.clerk.accounts.dev',
  PACEMAKER_MCP_OAUTH_CLIENT_ID: 'client_123'
};

describe('loadConfig', () => {
  it('defaults to the development profile and local API', () => {
    const config = loadConfig(BASE_ENV);

    assert.equal(config.profile, 'development');
    assert.equal(config.apiOrigin, 'http://localhost:3000');
    assert.equal(config.hostId, undefined);
    assert.equal(redirectUriFor(config), 'http://127.0.0.1:53134/callback');
  });

  it('needs no settings to reach the Clerk development instance', () => {
    const config = loadConfig({});

    assert.equal(
      config.clerkIssuer,
      'https://flowing-imp-24.clerk.accounts.dev'
    );
    assert.equal(config.oauthClientId, 'fJkMj3Mil3vjq9So');
  });

  it('accepts a loopback API origin override', () => {
    const config = loadConfig({
      ...BASE_ENV,
      PACEMAKER_MCP_API_ORIGIN: 'http://127.0.0.1:3001'
    });

    assert.equal(config.apiOrigin, 'http://127.0.0.1:3001');
  });

  for (const origin of [
    'https://pacemaker.example.com',
    'http://192.168.0.10:3000',
    'http://localhost:3000/api',
    'http://localhost:3000?x=1',
    'http://user:pass@localhost:3000'
  ]) {
    it(`rejects API origin ${origin}`, () => {
      assert.throws(
        () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_API_ORIGIN: origin }),
        ConfigError
      );
    });
  }

  it('refuses the production profile in this POC', () => {
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_PROFILE: 'production' }),
      /not enabled/
    );
  });

  it('requires an https Clerk issuer', () => {
    assert.throws(
      () =>
        loadConfig({
          ...BASE_ENV,
          PACEMAKER_MCP_CLERK_ISSUER: 'http://example.clerk.accounts.dev'
        }),
      /https/
    );
    assert.throws(
      () =>
        loadConfig({
          ...BASE_ENV,
          PACEMAKER_MCP_CLERK_ISSUER: 'https://example.clerk.accounts.dev/x'
        }),
      /origin/
    );
  });

  it('validates the OAuth client id, redirect port and host id', () => {
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_OAUTH_CLIENT_ID: 'a b' }),
      ConfigError
    );
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_REDIRECT_PORT: '80' }),
      ConfigError
    );
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_HOST: 'Claude Desktop' }),
      ConfigError
    );
    assert.equal(
      loadConfig({ ...BASE_ENV, PACEMAKER_MCP_HOST: 'codex' }).hostId,
      'codex'
    );
  });
});

describe('hostIdFromClientName', () => {
  it('turns the MCP client name into a keyring-safe host id', () => {
    assert.equal(hostIdFromClientName('claude-code'), 'claude-code');
    assert.equal(hostIdFromClientName('codex-mcp-client'), 'codex-mcp-client');
    assert.equal(hostIdFromClientName('Claude Desktop'), 'claude-desktop');
    assert.equal(hostIdFromClientName(' My_App!! '), 'my-app');
    assert.equal(hostIdFromClientName('a'.repeat(39) + ' b'), 'a'.repeat(39));
  });

  it('falls back to "default" without a usable name', () => {
    assert.equal(hostIdFromClientName(undefined), 'default');
    assert.equal(hostIdFromClientName('!!!'), 'default');
  });
});
