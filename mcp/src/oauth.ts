import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { InvalidGrantError, UserFacingError } from './errors.ts';

const REQUEST_TIMEOUT_MS = 10_000;

export type FetchFn = typeof fetch;

export type OAuthEndpoints = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint?: string;
};

export type OAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds: number;
};

export type PkcePair = { verifier: string; challenge: string };

export function createPkcePair(): PkcePair {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function createState(): string {
  return randomBytes(16).toString('base64url');
}

function requireSameOriginHttps(value: unknown, issuer: string, name: string) {
  if (typeof value !== 'string') {
    throw new UserFacingError(`OAuth discovery is missing ${name}.`);
  }

  const url = new URL(value);
  if (url.protocol !== 'https:' || url.origin !== issuer) {
    throw new UserFacingError(
      `OAuth ${name} must be an https URL on the configured issuer.`
    );
  }

  return url.toString();
}

export async function discoverEndpoints(
  issuer: string,
  fetchFn: FetchFn = fetch
): Promise<OAuthEndpoints> {
  let response: Response;
  try {
    response = await fetchFn(`${issuer}/.well-known/openid-configuration`, {
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch {
    throw new UserFacingError(
      'Could not reach the Pacemaker sign-in service. Check your network connection.'
    );
  }

  if (!response.ok) {
    throw new UserFacingError(
      `Pacemaker sign-in discovery failed (HTTP ${response.status}).`
    );
  }

  const metadata = (await response.json()) as Record<string, unknown>;
  if (
    typeof metadata.issuer !== 'string' ||
    metadata.issuer.replace(/\/$/, '') !== issuer
  ) {
    throw new UserFacingError('OAuth discovery issuer does not match.');
  }

  return {
    authorizationEndpoint: requireSameOriginHttps(
      metadata.authorization_endpoint,
      issuer,
      'authorization_endpoint'
    ),
    tokenEndpoint: requireSameOriginHttps(
      metadata.token_endpoint,
      issuer,
      'token_endpoint'
    ),
    revocationEndpoint:
      metadata.revocation_endpoint === undefined
        ? undefined
        : requireSameOriginHttps(
            metadata.revocation_endpoint,
            issuer,
            'revocation_endpoint'
          )
  };
}

export function buildAuthorizeUrl(input: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL(input.authorizationEndpoint);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('scope', input.scopes.join(' '));
  url.searchParams.set('state', input.state);
  url.searchParams.set('code_challenge', input.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

const CALLBACK_PAGE = (message: string) =>
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Pacemaker MCP</title><body style="font-family:system-ui;padding:2rem"><p>${message}</p></body></html>`;

export type CallbackListener = {
  code: Promise<string>;
  close: () => void;
};

// Listens on the loopback redirect URI until the expected state arrives.
// Requests with a different state are answered with 400 and ignored, so a
// stray or forged request cannot end the sign-in.
export function listenForAuthorizationCode(input: {
  port: number;
  state: string;
  timeoutMs: number;
}): Promise<CallbackListener> {
  return new Promise((resolveListener, rejectListener) => {
    let settle: {
      resolve: (code: string) => void;
      reject: (error: Error) => void;
    };
    const code = new Promise<string>((resolve, reject) => {
      settle = { resolve, reject };
    });
    code.catch(() => {});

    const server = createServer((request, response) => {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      if (url.pathname !== '/callback') {
        response.writeHead(404).end();
        return;
      }

      if (url.searchParams.get('state') !== input.state) {
        response
          .writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
          .end(CALLBACK_PAGE('This sign-in link is not valid.'));
        return;
      }

      const error = url.searchParams.get('error');
      const authorizationCode = url.searchParams.get('code');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

      if (error || !authorizationCode) {
        response.end(
          CALLBACK_PAGE('Sign-in was cancelled. You can close this window.')
        );
        finish(new UserFacingError('Pacemaker sign-in was cancelled.'));
        return;
      }

      response.end(
        CALLBACK_PAGE(
          'Signed in to Pacemaker. You can close this window and return to your assistant.'
        )
      );
      finish(null, authorizationCode);
    });

    const timer = setTimeout(
      () =>
        finish(
          new UserFacingError(
            'Pacemaker sign-in was not completed in time. Run the request again to retry.'
          )
        ),
      input.timeoutMs
    );
    timer.unref();

    function finish(error: Error | null, authorizationCode?: string) {
      clearTimeout(timer);
      server.close();
      if (error) {
        settle.reject(error);
      } else {
        settle.resolve(authorizationCode as string);
      }
    }

    server.once('error', (error: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      rejectListener(
        error.code === 'EADDRINUSE'
          ? new UserFacingError(
              `Sign-in callback port ${input.port} is already in use. Close the other program or set PACEMAKER_MCP_REDIRECT_PORT.`
            )
          : new UserFacingError('Could not start the sign-in callback server.')
      );
    });

    server.listen(input.port, '127.0.0.1', () => {
      resolveListener({
        code,
        close: () =>
          finish(new UserFacingError('Pacemaker sign-in was cancelled.'))
      });
    });
  });
}

async function postTokenRequest(
  tokenEndpoint: string,
  body: URLSearchParams,
  fetchFn: FetchFn
): Promise<OAuthTokens> {
  let response: Response;
  try {
    response = await fetchFn(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch {
    throw new UserFacingError(
      'Could not reach the Pacemaker sign-in service. Check your network connection.'
    );
  }

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    if (payload.error === 'invalid_grant') {
      throw new InvalidGrantError();
    }
    throw new UserFacingError(
      `Pacemaker sign-in token request failed (HTTP ${response.status}).`
    );
  }

  if (typeof payload.access_token !== 'string') {
    throw new UserFacingError('Pacemaker sign-in returned no access token.');
  }

  return {
    accessToken: payload.access_token,
    refreshToken:
      typeof payload.refresh_token === 'string'
        ? payload.refresh_token
        : undefined,
    expiresInSeconds:
      typeof payload.expires_in === 'number' ? payload.expires_in : 3600
  };
}

export function exchangeAuthorizationCode(
  input: {
    tokenEndpoint: string;
    clientId: string;
    redirectUri: string;
    code: string;
    codeVerifier: string;
  },
  fetchFn: FetchFn = fetch
): Promise<OAuthTokens> {
  return postTokenRequest(
    input.tokenEndpoint,
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: input.clientId,
      redirect_uri: input.redirectUri,
      code: input.code,
      code_verifier: input.codeVerifier
    }),
    fetchFn
  );
}

export function refreshAccessToken(
  input: { tokenEndpoint: string; clientId: string; refreshToken: string },
  fetchFn: FetchFn = fetch
): Promise<OAuthTokens> {
  return postTokenRequest(
    input.tokenEndpoint,
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: input.clientId,
      refresh_token: input.refreshToken
    }),
    fetchFn
  );
}

export async function revokeToken(
  input: { revocationEndpoint: string; clientId: string; token: string },
  fetchFn: FetchFn = fetch
): Promise<boolean> {
  try {
    const response = await fetchFn(input.revocationEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: input.clientId,
        token: input.token,
        token_type_hint: 'refresh_token'
      }),
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Opens the system browser without a shell, so the URL is never parsed as a
// command line (cmd.exe would split it at "&").
export function openBrowser(url: string): Promise<boolean> {
  const [command, args] =
    process.platform === 'win32'
      ? ['rundll32.exe', ['url.dll,FileProtocolHandler', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];

  return new Promise((resolve) => {
    try {
      const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
      child.once('error', () => resolve(false));
      child.once('spawn', () => {
        child.unref();
        resolve(true);
      });
    } catch {
      resolve(false);
    }
  });
}
