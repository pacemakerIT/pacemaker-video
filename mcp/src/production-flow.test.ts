import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadConfig, OAUTH_SCOPES } from './config.ts';
import { SignInRequiredError, UserFacingError } from './errors.ts';
import { AuthSession, createClerkOAuthProvider } from './session.ts';
import { keyringAccountFor } from './token-store.ts';
import { fakeOAuth, memoryStore, routeFetch } from './test-helpers.ts';

const CLERK = 'https://clerk.paceupcareer.com';
const API = 'https://www.paceupcareer.com';

function productionConfig(port = 40000 + Math.floor(Math.random() * 20000)) {
  return loadConfig({
    PACEMAKER_MCP_PROFILE: 'production',
    PACEMAKER_MCP_REDIRECT_PORT: String(port),
    PACEMAKER_MCP_HOST: 'test'
  });
}

function discovery(overrides: Record<string, unknown> = {}) {
  return {
    issuer: CLERK,
    authorization_endpoint: `${CLERK}/oauth/authorize`,
    token_endpoint: `${CLERK}/oauth/token`,
    revocation_endpoint: `${CLERK}/oauth/token/revoke`,
    ...overrides
  };
}

async function startLogin(metadata: Record<string, unknown>) {
  const http = routeFetch(() => ({ status: 200, body: metadata }));
  const opened: string[] = [];
  const provider = createClerkOAuthProvider({
    config: productionConfig(),
    fetchFn: http.fetchFn,
    openBrowser: async (url) => {
      opened.push(url);
      return true;
    },
    log: () => {}
  });
  return { provider, http, opened };
}

describe('production sign-in', () => {
  it('discovers endpoints only on the production Clerk issuer', async () => {
    const { provider, http, opened } = await startLogin(discovery());
    const login = await provider.startLogin();
    login.tokens.catch(() => {});
    login.cancel();

    assert.deepEqual(
      http.requests.map((request) => request.url),
      [`${CLERK}/.well-known/openid-configuration`]
    );

    const url = new URL(login.authorizeUrl);
    assert.equal(url.origin, CLERK);
    assert.equal(url.pathname, '/oauth/authorize');
    assert.equal(url.searchParams.get('client_id'), 'v919d0TaD1AGZ3np');
    assert.equal(url.searchParams.get('response_type'), 'code');
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
    assert.ok(url.searchParams.get('code_challenge'));
    assert.ok(url.searchParams.get('state'));
    assert.match(
      url.searchParams.get('redirect_uri') ?? '',
      /^http:\/\/127\.0\.0\.1:\d+\/callback$/
    );
    assert.deepEqual(
      (url.searchParams.get('scope') ?? '').split(' ').sort(),
      [...OAUTH_SCOPES].sort()
    );
    assert.deepEqual(opened, [login.authorizeUrl]);
  });

  it('refuses a discovery document from another issuer', async () => {
    for (const issuer of [
      'https://flowing-imp-24.clerk.accounts.dev',
      'https://clerk.paceupcareer.com.evil.com',
      'http://clerk.paceupcareer.com'
    ]) {
      const { provider, opened } = await startLogin(discovery({ issuer }));
      await assert.rejects(provider.startLogin(), UserFacingError, issuer);
      assert.deepEqual(opened, [], 'no browser window for a bad issuer');
    }
  });

  it('refuses endpoints that leave the issuer', async () => {
    for (const override of [
      { authorization_endpoint: 'https://evil.example.com/oauth/authorize' },
      { token_endpoint: 'https://evil.example.com/oauth/token' },
      { token_endpoint: 'http://clerk.paceupcareer.com/oauth/token' },
      { revocation_endpoint: 'https://evil.example.com/revoke' },
      { token_endpoint: 'https://clerk.paceupcareer.com.evil.com/oauth/token' }
    ]) {
      const { provider, opened } = await startLogin(discovery(override));
      await assert.rejects(
        provider.startLogin(),
        UserFacingError,
        JSON.stringify(override)
      );
      assert.deepEqual(opened, []);
    }
  });

  it('refuses a discovery document with missing endpoints', async () => {
    for (const metadata of [
      {},
      { issuer: CLERK },
      discovery({ authorization_endpoint: undefined }),
      discovery({ token_endpoint: 42 })
    ]) {
      const { provider } = await startLogin(metadata);
      await assert.rejects(provider.startLogin(), UserFacingError);
    }
  });
});

describe('production token exchange', () => {
  function session(
    handler: Parameters<typeof routeFetch>[0],
    refreshToken: string | null = 'refresh-1'
  ) {
    const http = routeFetch(handler);
    const oauth = fakeOAuth();
    const store = memoryStore(refreshToken);
    const instance = new AuthSession({
      config: productionConfig(),
      oauth: oauth.oauth,
      store: store.store,
      fetchFn: http.fetchFn,
      now: () => 1_000_000,
      log: () => {}
    });
    return { instance, http, oauth, store };
  }

  it('posts the Clerk token only to the production API', async () => {
    const { instance, http } = session(() => ({
      status: 200,
      body: { access_token: 'api-token', expires_in: 300 }
    }));

    assert.equal(await instance.getApiToken(), 'api-token');
    assert.deepEqual(
      http.requests.map((r) => [r.method, r.url, r.auth]),
      [['POST', `${API}/api/mcp/token`, 'Bearer clerk-access-from-refresh-1']]
    );
  });

  it('does not follow a redirect from the token endpoint', async () => {
    for (const status of [301, 302, 307, 308]) {
      const { instance, http } = session(() => ({ status }));

      await assert.rejects(
        instance.getApiToken(),
        new RegExp(`HTTP ${status}`)
      );
      assert.equal(http.requests.length, 1, `status ${status}`);
    }
  });

  it('tells a non-admin to use an admin account and keeps the sign-in', async () => {
    const { instance, store } = session(() => ({
      status: 403,
      body: { error: 'Admin role required.' }
    }));

    await assert.rejects(instance.getApiToken(), /admin account/);
    // Not signed out: Clerk rotated the refresh token and the new one is kept.
    assert.equal(store.read(), 'refresh-1-rotated');
  });

  it('reports an unconfigured server', async () => {
    const { instance } = session(() => ({
      status: 503,
      body: { error: 'MCP OAuth client is not configured.' }
    }));

    await assert.rejects(instance.getApiToken(), /not configured/);
  });

  it('asks to sign in again after two rejected Clerk tokens', async () => {
    const { instance, oauth, store, http } = session(() => ({ status: 401 }));

    await assert.rejects(instance.getApiToken(), SignInRequiredError);
    assert.equal(http.requests.length, 2);
    assert.equal(oauth.calls.refresh.length, 2);
    assert.equal(store.read(), null);
  });

  it('rejects malformed token responses', async () => {
    for (const body of [
      {},
      { access_token: 'x' },
      { access_token: 'x', expires_in: '300' },
      { access_token: 123, expires_in: 300 },
      { access_token: '', expires_in: NaN }
    ]) {
      const { instance } = session(() => ({ status: 200, body }));
      await assert.rejects(
        instance.getApiToken(),
        UserFacingError,
        JSON.stringify(body)
      );
    }
  });

  it('turns a network failure into a readable message', async () => {
    const http = routeFetch(() => ({ status: 200 }));
    const instance = new AuthSession({
      config: productionConfig(),
      oauth: fakeOAuth().oauth,
      store: memoryStore('refresh-1').store,
      fetchFn: async () => {
        throw new TypeError('fetch failed');
      },
      now: () => 1_000_000,
      log: () => {}
    });

    await assert.rejects(instance.getApiToken(), /Could not reach/);
    assert.equal(http.requests.length, 0);
  });
});

describe('stored sign-ins', () => {
  it('keeps production and development sign-ins in separate entries', () => {
    for (const host of ['claude-desktop', 'claude-code', 'codex', 'default']) {
      assert.notEqual(
        keyringAccountFor('production', host),
        keyringAccountFor('development', host)
      );
    }
    assert.equal(keyringAccountFor('production', 'codex'), 'production:codex');
  });
});
