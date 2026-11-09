import { generateKeyPairSync } from 'node:crypto';

// Used by `next dev` when MCP_* variables are missing, so developers can try
// the local MCP without extra setup. Never used outside development: deployed
// environments must set every MCP_* variable.
const DEVELOPMENT_DEFAULTS = {
  issuer: 'urn:pacemaker:mcp-api:development',
  audience: 'urn:pacemaker:admin-api:development',
  keyId: 'development-ephemeral',
  // Public client ID of the Clerk development OAuth app for the local MCP.
  oauthClientId: 'fJkMj3Mil3vjq9So'
};

type KeyPairPem = { privateKeyPem: string; publicKeyPem: string };

// Kept on globalThis so every route bundle in the dev server signs and
// verifies with the same pair. A restart creates a new pair; the MCP client
// then exchanges its Clerk token for a new API token.
const globalForMcp = globalThis as typeof globalThis & {
  pacemakerMcpDevelopmentKeys?: KeyPairPem;
};

function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

function getDevelopmentKeyPair(): KeyPairPem {
  if (!globalForMcp.pacemakerMcpDevelopmentKeys) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' }
    });
    globalForMcp.pacemakerMcpDevelopmentKeys = {
      privateKeyPem: privateKey,
      publicKeyPem: publicKey
    };
  }
  return globalForMcp.pacemakerMcpDevelopmentKeys;
}

function withDevelopmentDefault(
  value: string | undefined,
  fallback: string
): string | undefined {
  return value || (isDevelopment() ? fallback : undefined);
}

export function getMcpOAuthClientId(): string | undefined {
  return withDevelopmentDefault(
    process.env.MCP_OAUTH_CLIENT_ID?.trim(),
    DEVELOPMENT_DEFAULTS.oauthClientId
  );
}

export function getMcpTokenSettings() {
  const issuer = withDevelopmentDefault(
    process.env.MCP_API_JWT_ISSUER?.trim(),
    DEVELOPMENT_DEFAULTS.issuer
  );
  const audience = withDevelopmentDefault(
    process.env.MCP_API_JWT_AUDIENCE?.trim(),
    DEVELOPMENT_DEFAULTS.audience
  );
  const keyId = withDevelopmentDefault(
    process.env.MCP_API_JWT_KEY_ID?.trim(),
    DEVELOPMENT_DEFAULTS.keyId
  );
  let privateKeyPem = process.env.MCP_API_JWT_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n'
  );
  let publicKeyPem = process.env.MCP_API_JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
  const oauthClientId = getMcpOAuthClientId();

  if (!privateKeyPem && !publicKeyPem && isDevelopment()) {
    ({ privateKeyPem, publicKeyPem } = getDevelopmentKeyPair());
  }

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
