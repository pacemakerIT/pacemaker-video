import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InvalidGrantError, SignInRequiredError } from './errors.ts';
import { AuthSession } from './session.ts';
import {
  fakeOAuth,
  flush,
  memoryStore,
  routeFetch,
  TEST_CONFIG
} from './test-helpers.ts';

function exchangeOk() {
  let issued = 0;
  return routeFetch(() => ({
    status: 200,
    body: { access_token: `api-token-${++issued}`, expires_in: 300 }
  }));
}

function createSession(input: {
  oauth: ReturnType<typeof fakeOAuth>['oauth'];
  store: ReturnType<typeof memoryStore>['store'];
  fetchFn: ReturnType<typeof routeFetch>['fetchFn'];
  clock?: { now: number };
}) {
  const clock = input.clock ?? { now: 1_000_000 };
  return new AuthSession({
    config: TEST_CONFIG,
    oauth: input.oauth,
    store: input.store,
    fetchFn: input.fetchFn,
    now: () => clock.now,
    log: () => {}
  });
}

describe('AuthSession', () => {
  it('starts a background browser sign-in when nothing is stored', async () => {
    const oauth = fakeOAuth();
    const store = memoryStore();
    const api = exchangeOk();
    const session = createSession({
      oauth: oauth.oauth,
      store: store.store,
      fetchFn: api.fetchFn
    });

    await assert.rejects(session.getApiToken(), SignInRequiredError);
    // A second call while the browser is open does not start another login.
    await assert.rejects(session.getApiToken(), /still in progress/);
    assert.equal(oauth.calls.startLogin, 1);

    oauth.completeLogin({
      accessToken: 'clerk-access',
      refreshToken: 'refresh-1',
      expiresInSeconds: 86400
    });
    await flush();

    assert.equal(store.read(), 'refresh-1');
    assert.equal(await session.getApiToken(), 'api-token-1');
    assert.equal(api.requests[0].url, 'http://localhost:3000/api/mcp/token');
    assert.equal(api.requests[0].method, 'POST');
    assert.equal(api.requests[0].auth, 'Bearer clerk-access');
  });

  it('refreshes with the stored token and saves the rotated one', async () => {
    const oauth = fakeOAuth();
    const store = memoryStore('refresh-1');
    const api = exchangeOk();
    const session = createSession({
      oauth: oauth.oauth,
      store: store.store,
      fetchFn: api.fetchFn
    });

    assert.equal(await session.getApiToken(), 'api-token-1');
    assert.deepEqual(oauth.calls.refresh, ['refresh-1']);
    assert.equal(store.read(), 'refresh-1-rotated');
    assert.equal(oauth.calls.startLogin, 0);
  });

  it('reuses the API token until it nears expiry', async () => {
    const clock = { now: 1_000_000 };
    const oauth = fakeOAuth();
    const api = exchangeOk();
    const session = createSession({
      oauth: oauth.oauth,
      store: memoryStore('refresh-1').store,
      fetchFn: api.fetchFn,
      clock
    });

    assert.equal(await session.getApiToken(), 'api-token-1');
    clock.now += 200_000;
    assert.equal(await session.getApiToken(), 'api-token-1');
    clock.now += 80_000; // 20s left, inside the refresh margin
    assert.equal(await session.getApiToken(), 'api-token-2');
    // The Clerk access token is still valid, so no second refresh.
    assert.equal(oauth.calls.refresh.length, 1);
  });

  it('shares one exchange between concurrent calls', async () => {
    const api = exchangeOk();
    const session = createSession({
      oauth: fakeOAuth().oauth,
      store: memoryStore('refresh-1').store,
      fetchFn: api.fetchFn
    });

    const tokens = await Promise.all([
      session.getApiToken(),
      session.getApiToken(),
      session.getApiToken()
    ]);

    assert.deepEqual(tokens, ['api-token-1', 'api-token-1', 'api-token-1']);
    assert.equal(api.requests.length, 1);
  });

  it('clears a rejected refresh token and asks for a new sign-in', async () => {
    const oauth = fakeOAuth({
      refresh: async () => {
        throw new InvalidGrantError();
      }
    });
    const store = memoryStore('revoked');
    const session = createSession({
      oauth: oauth.oauth,
      store: store.store,
      fetchFn: exchangeOk().fetchFn
    });

    await assert.rejects(session.getApiToken(), SignInRequiredError);
    assert.equal(store.read(), null);
    assert.equal(oauth.calls.startLogin, 1);
  });

  it('reports a non-admin account without starting a sign-in loop', async () => {
    const oauth = fakeOAuth();
    const session = createSession({
      oauth: oauth.oauth,
      store: memoryStore('refresh-1').store,
      fetchFn: routeFetch(() => ({ status: 403, body: { error: 'Forbidden' } }))
        .fetchFn
    });

    await assert.rejects(session.getApiToken(), /admin account/);
    assert.equal(oauth.calls.startLogin, 0);
  });

  it('retries once with a fresh Clerk token when the exchange returns 401', async () => {
    let call = 0;
    const api = routeFetch(() =>
      ++call === 1
        ? { status: 401, body: { error: 'Unauthorized.' } }
        : { status: 200, body: { access_token: 'api-token', expires_in: 300 } }
    );
    const oauth = fakeOAuth();
    const session = createSession({
      oauth: oauth.oauth,
      store: memoryStore('refresh-1').store,
      fetchFn: api.fetchFn
    });

    assert.equal(await session.getApiToken(), 'api-token');
    assert.equal(oauth.calls.refresh.length, 2);
  });

  it('explains when the API server is not reachable', async () => {
    const session = createSession({
      oauth: fakeOAuth().oauth,
      store: memoryStore('refresh-1').store,
      fetchFn: async () => {
        throw new TypeError('fetch failed');
      }
    });

    await assert.rejects(session.getApiToken(), /Is the server running/);
  });

  it('signs out by clearing, revoking and cancelling a pending sign-in', async () => {
    const oauth = fakeOAuth();
    const store = memoryStore('refresh-1');
    const session = createSession({
      oauth: oauth.oauth,
      store: store.store,
      fetchFn: exchangeOk().fetchFn
    });

    assert.deepEqual(await session.signOut(), {
      hadSession: true,
      revoked: true
    });
    assert.deepEqual(oauth.calls.revoke, ['refresh-1']);
    assert.equal(store.read(), null);

    await assert.rejects(session.getApiToken(), SignInRequiredError);
    await session.signOut();
    assert.equal(oauth.wasCancelled(), true);
  });
});
