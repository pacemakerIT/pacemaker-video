import { generateKeyPairSync, type KeyObject } from 'node:crypto';
import { SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  MCP_MAIN_VISUAL_READ_SCOPE,
  signMcpApiAccessToken,
  verifyMcpApiAccessToken
} from '@/lib/mcp-api-token';

const originalEnvironment = {
  issuer: process.env.MCP_API_JWT_ISSUER,
  audience: process.env.MCP_API_JWT_AUDIENCE,
  keyId: process.env.MCP_API_JWT_KEY_ID,
  privateKey: process.env.MCP_API_JWT_PRIVATE_KEY,
  publicKey: process.env.MCP_API_JWT_PUBLIC_KEY,
  clientId: process.env.MCP_OAUTH_CLIENT_ID
};

function createSignedJwt(
  privateKey: KeyObject,
  overrides: {
    audience?: string;
    expiration?: string | number;
    issuer?: string;
    scope?: string;
    typ?: string;
  } = {}
) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    client_id: 'test-clerk-oauth-client',
    scope: overrides.scope ?? MCP_MAIN_VISUAL_READ_SCOPE
  })
    .setProtectedHeader({
      alg: 'RS256',
      typ: overrides.typ ?? 'at+jwt',
      kid: 'test-key'
    })
    .setIssuer(overrides.issuer ?? 'https://api.pacemaker.test')
    .setSubject('user_test_admin')
    .setAudience(overrides.audience ?? 'urn:pacemaker:admin-api:test')
    .setIssuedAt(now)
    .setExpirationTime(overrides.expiration ?? now + 300)
    .setJti('test-token-id')
    .sign(privateKey);
}

describe('MCP API access token', () => {
  let privateKey: KeyObject;
  let publicKey: KeyObject;

  beforeAll(() => {
    ({ privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048
    }));

    process.env.MCP_API_JWT_ISSUER = 'https://api.pacemaker.test';
    process.env.MCP_API_JWT_AUDIENCE = 'urn:pacemaker:admin-api:test';
    process.env.MCP_API_JWT_KEY_ID = 'test-key';
    process.env.MCP_API_JWT_PRIVATE_KEY = privateKey
      .export({ type: 'pkcs8', format: 'pem' })
      .toString();
    process.env.MCP_API_JWT_PUBLIC_KEY = publicKey
      .export({ type: 'spki', format: 'pem' })
      .toString();
    process.env.MCP_OAUTH_CLIENT_ID = 'test-clerk-oauth-client';
  });

  afterAll(() => {
    const values: Record<string, string | undefined> = {
      MCP_API_JWT_ISSUER: originalEnvironment.issuer,
      MCP_API_JWT_AUDIENCE: originalEnvironment.audience,
      MCP_API_JWT_KEY_ID: originalEnvironment.keyId,
      MCP_API_JWT_PRIVATE_KEY: originalEnvironment.privateKey,
      MCP_API_JWT_PUBLIC_KEY: originalEnvironment.publicKey,
      MCP_OAUTH_CLIENT_ID: originalEnvironment.clientId
    };

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('issues and verifies a short-lived API-scoped token', async () => {
    const token = await signMcpApiAccessToken({
      subject: 'user_test_admin',
      clientId: 'test-clerk-oauth-client',
      scopes: [MCP_MAIN_VISUAL_READ_SCOPE]
    });

    const principal = await verifyMcpApiAccessToken(
      token,
      MCP_MAIN_VISUAL_READ_SCOPE
    );

    expect(principal).toEqual({
      subject: 'user_test_admin',
      clientId: 'test-clerk-oauth-client',
      scopes: [MCP_MAIN_VISUAL_READ_SCOPE]
    });
  });

  it('rejects a token for a different audience', async () => {
    const token = await createSignedJwt(privateKey, {
      audience: 'urn:pacemaker:other-api'
    });

    await expect(
      verifyMcpApiAccessToken(token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).rejects.toThrow();
  });

  it('rejects an expired token', async () => {
    const token = await createSignedJwt(privateKey, {
      expiration: Math.floor(Date.now() / 1000) - 30
    });

    await expect(
      verifyMcpApiAccessToken(token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).rejects.toThrow();
  });

  it('rejects a token without the required scope', async () => {
    const token = await createSignedJwt(privateKey, { scope: 'openid' });

    await expect(
      verifyMcpApiAccessToken(token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).rejects.toThrow();
  });

  it('rejects an ID-token-shaped JWT', async () => {
    const token = await createSignedJwt(privateKey, { typ: 'JWT' });

    await expect(
      verifyMcpApiAccessToken(token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).rejects.toThrow();
  });

  it('rejects a token issued by a different service', async () => {
    const token = await createSignedJwt(privateKey, {
      issuer: 'https://untrusted-issuer.test'
    });

    await expect(
      verifyMcpApiAccessToken(token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).rejects.toThrow();
  });

  it('rejects a token with a different OAuth client ID', async () => {
    const token = await new SignJWT({
      client_id: 'other-clerk-oauth-client',
      scope: MCP_MAIN_VISUAL_READ_SCOPE
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'at+jwt', kid: 'test-key' })
      .setIssuer('https://api.pacemaker.test')
      .setSubject('user_test_admin')
      .setAudience('urn:pacemaker:admin-api:test')
      .setIssuedAt()
      .setExpirationTime('5m')
      .setJti('wrong-client-token')
      .sign(privateKey);

    await expect(
      verifyMcpApiAccessToken(token, MCP_MAIN_VISUAL_READ_SCOPE)
    ).rejects.toThrow();
  });

  it('rejects a token with a modified signature', async () => {
    const token = await signMcpApiAccessToken({
      subject: 'user_test_admin',
      clientId: 'test-clerk-oauth-client',
      scopes: [MCP_MAIN_VISUAL_READ_SCOPE]
    });
    const [header, payload, signature] = token.split('.');
    // The last base64url character carries padding bits, so tamper with the first.
    const modifiedSignature = `${signature.startsWith('a') ? 'b' : 'a'}${signature.slice(1)}`;

    await expect(
      verifyMcpApiAccessToken(
        `${header}.${payload}.${modifiedSignature}`,
        MCP_MAIN_VISUAL_READ_SCOPE
      )
    ).rejects.toThrow();
  });
});
