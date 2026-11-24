import type { McpConfig } from './config.ts';
import type { FetchFn, OAuthTokens } from './oauth.ts';
import type { LoginHandle, OAuthProvider } from './session.ts';
import type { RefreshTokenStore } from './token-store.ts';

export const TEST_CONFIG: McpConfig = {
  profile: 'development',
  apiOrigin: 'http://localhost:3000',
  clerkIssuer: 'https://example.clerk.accounts.dev',
  oauthClientId: 'client_123',
  redirectPort: 53134,
  hostId: 'default'
};

export function memoryStore(initial: string | null = null) {
  let value = initial;
  const store: RefreshTokenStore = {
    async get() {
      return value;
    },
    async set(token) {
      value = token;
    },
    async clear() {
      value = null;
    },
    isPersistent() {
      return true;
    }
  };
  return { store, read: () => value };
}

export function fakeOAuth(
  overrides: {
    refresh?: (refreshToken: string) => Promise<OAuthTokens>;
  } = {}
) {
  const calls = {
    startLogin: 0,
    refresh: [] as string[],
    revoke: [] as string[]
  };
  let resolveLogin: ((tokens: OAuthTokens) => void) | undefined;
  let cancelled = false;

  const oauth: OAuthProvider = {
    async startLogin(): Promise<LoginHandle> {
      calls.startLogin++;
      const tokens = new Promise<OAuthTokens>((resolve) => {
        resolveLogin = resolve;
      });
      return {
        authorizeUrl: 'https://example.clerk.accounts.dev/oauth/authorize?x=1',
        tokens,
        cancel: () => {
          cancelled = true;
        }
      };
    },
    async refresh(refreshToken) {
      calls.refresh.push(refreshToken);
      if (overrides.refresh) return overrides.refresh(refreshToken);
      return {
        accessToken: `clerk-access-from-${refreshToken}`,
        refreshToken: `${refreshToken}-rotated`,
        expiresInSeconds: 86400
      };
    },
    async revoke(refreshToken) {
      calls.revoke.push(refreshToken);
      return true;
    }
  };

  return {
    oauth,
    calls,
    completeLogin: (tokens: OAuthTokens) => resolveLogin?.(tokens),
    wasCancelled: () => cancelled
  };
}

export type RecordedRequest = {
  url: string;
  method: string;
  auth: string | null;
  body?: string;
};

export function routeFetch(
  handler: (request: RecordedRequest) => { status: number; body?: unknown }
) {
  const requests: RecordedRequest[] = [];
  const fetchFn: FetchFn = async (input, init) => {
    const headers = new Headers(init?.headers);
    const request = {
      url: String(input),
      method: init?.method ?? 'GET',
      auth: headers.get('authorization'),
      body: typeof init?.body === 'string' ? init.body : undefined
    };
    requests.push(request);
    const { status, body } = handler(request);
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };
  return { fetchFn, requests };
}

export const flush = () => new Promise((resolve) => setImmediate(resolve));
