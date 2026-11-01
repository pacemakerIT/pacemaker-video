import { randomUUID } from 'node:crypto';
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from 'jose';

export const MCP_MAIN_VISUAL_READ_SCOPE = 'mcp:main-visual:read';
export const MCP_API_TOKEN_TTL_SECONDS = 300;

export type McpApiTokenPrincipal = {
  subject: string;
  clientId: string;
  scopes: string[];
};

function getTokenSettings() {
  const issuer = process.env.MCP_API_JWT_ISSUER?.trim();
  const audience = process.env.MCP_API_JWT_AUDIENCE?.trim();
  const keyId = process.env.MCP_API_JWT_KEY_ID?.trim();
  const privateKeyPem = process.env.MCP_API_JWT_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n'
  );
  const publicKeyPem = process.env.MCP_API_JWT_PUBLIC_KEY?.replace(
    /\\n/g,
    '\n'
  );
  const oauthClientId = process.env.MCP_OAUTH_CLIENT_ID?.trim();

  if (
    !issuer ||
    !audience ||
    !keyId ||
    !privateKeyPem ||
    !publicKeyPem ||
    !oauthClientId
  ) {
    throw new Error('MCP API token settings are incomplete.');
  }

  return {
    issuer,
    audience,
    keyId,
    privateKeyPem,
    publicKeyPem,
    oauthClientId
  };
}

export async function signMcpApiAccessToken(input: {
  subject: string;
  clientId: string;
  scopes: string[];
}): Promise<string> {
  const settings = getTokenSettings();
  const privateKey = await importPKCS8(settings.privateKeyPem, 'RS256');

  return new SignJWT({
    client_id: input.clientId,
    scope: input.scopes.join(' ')
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'at+jwt', kid: settings.keyId })
    .setIssuer(settings.issuer)
    .setSubject(input.subject)
    .setAudience(settings.audience)
    .setIssuedAt()
    .setExpirationTime(`${MCP_API_TOKEN_TTL_SECONDS}s`)
    .setJti(randomUUID())
    .sign(privateKey);
}

export async function verifyMcpApiAccessToken(
  token: string,
  requiredScope: string
): Promise<McpApiTokenPrincipal> {
  const settings = getTokenSettings();
  const publicKey = await importSPKI(settings.publicKeyPem, 'RS256');
  const { payload, protectedHeader } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: settings.issuer,
    audience: settings.audience,
    clockTolerance: 5
  });

  if (protectedHeader.typ !== 'at+jwt') {
    throw new Error('Invalid MCP access token type.');
  }

  if (protectedHeader.kid !== settings.keyId) {
    throw new Error('Invalid MCP signing key identifier.');
  }

  const scopes =
    typeof payload.scope === 'string'
      ? payload.scope.split(' ').filter(Boolean)
      : [];

  if (
    typeof payload.sub !== 'string' ||
    typeof payload.client_id !== 'string' ||
    payload.client_id !== settings.oauthClientId ||
    typeof payload.iat !== 'number' ||
    typeof payload.exp !== 'number' ||
    typeof payload.jti !== 'string' ||
    payload.jti.length === 0 ||
    payload.exp <= payload.iat ||
    payload.exp - payload.iat > MCP_API_TOKEN_TTL_SECONDS ||
    !scopes.includes(requiredScope)
  ) {
    throw new Error('MCP access token is not authorized.');
  }

  return {
    subject: payload.sub,
    clientId: payload.client_id,
    scopes
  };
}
