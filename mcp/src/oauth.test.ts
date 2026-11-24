import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import { InvalidGrantError, UserFacingError } from './errors.ts';
import {
  buildAuthorizeUrl,
  createPkcePair,
  discoverEndpoints,
  listenForAuthorizationCode,
  refreshAccessToken,
  type FetchFn
} from './oauth.ts';

const ISSUER = 'https://example.clerk.accounts.dev';

function jsonFetch(status: number, body: unknown): FetchFn {
  return async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
}

function freePort() {
  return 40000 + Math.floor(Math.random() * 20000);
}

describe('PKCE', () => {
  it('derives the S256 challenge from the verifier', () => {
    const { verifier, challenge } = createPkcePair();

    assert.ok(verifier.length >= 43);
    assert.equal(
      challenge,
      createHash('sha256').update(verifier).digest('base64url')
    );
  });

  it('builds an authorization URL with PKCE and state', () => {
    const url = new URL(
      buildAuthorizeUrl({
        authorizationEndpoint: `${ISSUER}/oauth/authorize`,
        clientId: 'client_123',
        redirectUri: 'http://127.0.0.1:53134/callback',
        scopes: ['openid', 'offline_access'],
        state: 'state-1',
        codeChallenge: 'challenge-1'
      })
    );

    assert.equal(url.searchParams.get('response_type'), 'code');
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(url.searchParams.get('scope'), 'openid offline_access');
    assert.equal(url.searchParams.get('state'), 'state-1');
  });
});

describe('discoverEndpoints', () => {
  it('returns endpoints on the configured issuer', async () => {
    const endpoints = await discoverEndpoints(
      ISSUER,
      jsonFetch(200, {
        issuer: ISSUER,
        authorization_endpoint: `${ISSUER}/oauth/authorize`,
        token_endpoint: `${ISSUER}/oauth/token`
      })
    );

    assert.equal(endpoints.tokenEndpoint, `${ISSUER}/oauth/token`);
    assert.equal(endpoints.revocationEndpoint, undefined);
  });

  it('rejects a mismatched issuer', async () => {
    await assert.rejects(
      discoverEndpoints(
        ISSUER,
        jsonFetch(200, {
          issuer: 'https://evil.example',
          authorization_endpoint: `${ISSUER}/oauth/authorize`,
          token_endpoint: `${ISSUER}/oauth/token`
        })
      ),
      /issuer does not match/
    );
  });

  it('rejects endpoints on another origin', async () => {
    await assert.rejects(
      discoverEndpoints(
        ISSUER,
        jsonFetch(200, {
          issuer: ISSUER,
          authorization_endpoint: `${ISSUER}/oauth/authorize`,
          token_endpoint: 'https://evil.example/oauth/token'
        })
      ),
      /configured issuer/
    );
  });
});

describe('refreshAccessToken', () => {
  it('maps invalid_grant to InvalidGrantError', async () => {
    await assert.rejects(
      refreshAccessToken(
        {
          tokenEndpoint: `${ISSUER}/oauth/token`,
          clientId: 'client_123',
          refreshToken: 'old'
        },
        jsonFetch(400, { error: 'invalid_grant' })
      ),
      InvalidGrantError
    );
  });

  it('returns rotated tokens', async () => {
    const tokens = await refreshAccessToken(
      {
        tokenEndpoint: `${ISSUER}/oauth/token`,
        clientId: 'client_123',
        refreshToken: 'old'
      },
      jsonFetch(200, {
        access_token: 'access',
        refresh_token: 'new',
        expires_in: 86400
      })
    );

    assert.deepEqual(tokens, {
      accessToken: 'access',
      refreshToken: 'new',
      expiresInSeconds: 86400
    });
  });
});

describe('listenForAuthorizationCode', () => {
  it('ignores a wrong state and resolves the matching callback', async () => {
    const port = freePort();
    const listener = await listenForAuthorizationCode({
      port,
      state: 'expected',
      timeoutMs: 5000
    });

    const forged = await fetch(
      `http://127.0.0.1:${port}/callback?state=forged&code=bad`
    );
    assert.equal(forged.status, 400);

    const ok = await fetch(
      `http://127.0.0.1:${port}/callback?state=expected&code=good`
    );
    assert.equal(ok.status, 200);
    assert.equal(await listener.code, 'good');
  });

  it('rejects when the user cancels in the browser', async () => {
    const port = freePort();
    const listener = await listenForAuthorizationCode({
      port,
      state: 'expected',
      timeoutMs: 5000
    });

    await fetch(
      `http://127.0.0.1:${port}/callback?state=expected&error=access_denied`
    );
    await assert.rejects(listener.code, UserFacingError);
  });

  it('times out', async () => {
    const listener = await listenForAuthorizationCode({
      port: freePort(),
      state: 'expected',
      timeoutMs: 50
    });

    await assert.rejects(listener.code, /not completed in time/);
  });
});
