export const MAIN_VISUAL_READ_SCOPE = 'mcp:main-visual:read';
export const MAIN_VISUAL_WRITE_SCOPE = 'mcp:main-visual:write';
export const OAUTH_SCOPES = [
  'openid',
  'offline_access',
  MAIN_VISUAL_READ_SCOPE,
  MAIN_VISUAL_WRITE_SCOPE
];

const DEFAULT_DEVELOPMENT_API_ORIGIN = 'http://localhost:3000';
// Public identifiers of the Pacemaker Clerk development instance and its MCP
// OAuth app, so developers need no settings to try the MCP.
const DEVELOPMENT_CLERK_ISSUER = 'https://flowing-imp-24.clerk.accounts.dev';
const DEVELOPMENT_OAUTH_CLIENT_ID = 'fJkMj3Mil3vjq9So';
const DEFAULT_REDIRECT_PORT = 53134;
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export type ProfileName = 'development' | 'production';

export type McpConfig = {
  profile: ProfileName;
  apiOrigin: string;
  clerkIssuer: string;
  oauthClientId: string;
  redirectPort: number;
  // Undefined when PACEMAKER_MCP_HOST is not set; see hostIdFromClientName.
  hostId: string | undefined;
};

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function parseOriginOnlyUrl(value: string, name: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigError(`${name} must be an absolute URL.`);
  }

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== '/' && url.pathname !== '')
  ) {
    throw new ConfigError(`${name} must be an origin without path or query.`);
  }

  return url;
}

// The development API may only be a loopback origin, so a config edit cannot
// point the admin's Pacemaker token at an arbitrary host.
function resolveDevelopmentApiOrigin(value: string | undefined): string {
  if (!value) {
    return DEFAULT_DEVELOPMENT_API_ORIGIN;
  }

  const url = parseOriginOnlyUrl(value, 'PACEMAKER_MCP_API_ORIGIN');
  if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.has(url.hostname)) {
    throw new ConfigError(
      'PACEMAKER_MCP_API_ORIGIN must be a loopback http origin in the development profile.'
    );
  }

  return url.origin;
}

function resolveClerkIssuer(value: string | undefined): string {
  if (!value) {
    throw new ConfigError('PACEMAKER_MCP_CLERK_ISSUER is required.');
  }

  const url = parseOriginOnlyUrl(value, 'PACEMAKER_MCP_CLERK_ISSUER');
  if (url.protocol !== 'https:') {
    throw new ConfigError('PACEMAKER_MCP_CLERK_ISSUER must use https.');
  }

  return url.origin;
}

function resolveOAuthClientId(value: string | undefined): string {
  const clientId = value?.trim();
  if (!clientId || !/^[A-Za-z0-9_-]{1,128}$/.test(clientId)) {
    throw new ConfigError(
      'PACEMAKER_MCP_OAUTH_CLIENT_ID is required and may contain only letters, digits, "_" and "-".'
    );
  }

  return clientId;
}

function resolveRedirectPort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_REDIRECT_PORT;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new ConfigError(
      'PACEMAKER_MCP_REDIRECT_PORT must be an integer between 1024 and 65535.'
    );
  }

  return port;
}

// Each MCP host (Claude Desktop, Codex, ...) keeps its own refresh token entry,
// because Clerk rotates refresh tokens and two hosts sharing one would race.
function resolveHostId(value: string | undefined): string | undefined {
  const hostId = value?.trim();
  if (hostId === undefined || hostId === '') {
    return undefined;
  }
  if (!/^[a-z0-9-]{1,40}$/.test(hostId)) {
    throw new ConfigError(
      'PACEMAKER_MCP_HOST may contain only lowercase letters, digits and "-".'
    );
  }

  return hostId;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): McpConfig {
  const profile = env.PACEMAKER_MCP_PROFILE?.trim() || 'development';

  if (profile === 'production') {
    throw new ConfigError(
      'The production profile is not enabled in this POC. Use PACEMAKER_MCP_PROFILE=development.'
    );
  }

  if (profile !== 'development') {
    throw new ConfigError('PACEMAKER_MCP_PROFILE must be "development".');
  }

  return {
    profile,
    apiOrigin: resolveDevelopmentApiOrigin(env.PACEMAKER_MCP_API_ORIGIN),
    clerkIssuer: resolveClerkIssuer(
      env.PACEMAKER_MCP_CLERK_ISSUER || DEVELOPMENT_CLERK_ISSUER
    ),
    oauthClientId: resolveOAuthClientId(
      env.PACEMAKER_MCP_OAUTH_CLIENT_ID || DEVELOPMENT_OAUTH_CLIENT_ID
    ),
    redirectPort: resolveRedirectPort(env.PACEMAKER_MCP_REDIRECT_PORT),
    hostId: resolveHostId(env.PACEMAKER_MCP_HOST)
  };
}

// Without PACEMAKER_MCP_HOST, the host id comes from the name the MCP host
// sends when it connects (for example "claude-code" or "codex-mcp-client").
export function hostIdFromClientName(name: string | undefined): string {
  const hostId = (name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return hostId || 'default';
}

export function redirectUriFor(config: McpConfig): string {
  return `http://127.0.0.1:${config.redirectPort}/callback`;
}
