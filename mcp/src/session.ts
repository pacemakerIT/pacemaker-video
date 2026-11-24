import { OAUTH_SCOPES, redirectUriFor, type McpConfig } from './config.ts';
import {
  InvalidGrantError,
  SignInRequiredError,
  UserFacingError
} from './errors.ts';
import {
  buildAuthorizeUrl,
  createPkcePair,
  createState,
  discoverEndpoints,
  exchangeAuthorizationCode,
  listenForAuthorizationCode,
  refreshAccessToken,
  revokeToken,
  type FetchFn,
  type OAuthEndpoints,
  type OAuthTokens
} from './oauth.ts';
import type { Logger, RefreshTokenStore } from './token-store.ts';

const REQUEST_TIMEOUT_MS = 10_000;
const SIGN_IN_TIMEOUT_MS = 5 * 60_000;
const API_TOKEN_REFRESH_MARGIN_MS = 30_000;
const CLERK_TOKEN_REFRESH_MARGIN_MS = 60_000;

export type LoginHandle = {
  authorizeUrl: string;
  tokens: Promise<OAuthTokens>;
  cancel: () => void;
};

export type OAuthProvider = {
  startLogin(): Promise<LoginHandle>;
  refresh(refreshToken: string): Promise<OAuthTokens>;
  revoke(refreshToken: string): Promise<boolean>;
};

export function createClerkOAuthProvider(input: {
  config: McpConfig;
  fetchFn?: FetchFn;
  openBrowser: (url: string) => Promise<boolean>;
  log: Logger;
}): OAuthProvider {
  const { config, log } = input;
  const fetchFn = input.fetchFn ?? fetch;
  const redirectUri = redirectUriFor(config);
  let endpoints: Promise<OAuthEndpoints> | undefined;

  function getEndpoints() {
    endpoints ??= discoverEndpoints(config.clerkIssuer, fetchFn).catch(
      (error: unknown) => {
        endpoints = undefined;
        throw error;
      }
    );
    return endpoints;
  }

  return {
    async startLogin() {
      const { authorizationEndpoint, tokenEndpoint } = await getEndpoints();
      const pkce = createPkcePair();
      const state = createState();
      const listener = await listenForAuthorizationCode({
        port: config.redirectPort,
        state,
        timeoutMs: SIGN_IN_TIMEOUT_MS
      });
      const authorizeUrl = buildAuthorizeUrl({
        authorizationEndpoint,
        clientId: config.oauthClientId,
        redirectUri,
        scopes: OAUTH_SCOPES,
        state,
        codeChallenge: pkce.challenge
      });

      if (!(await input.openBrowser(authorizeUrl))) {
        log(
          'Could not open a browser; the sign-in URL was returned to the MCP host.'
        );
      }

      return {
        authorizeUrl,
        tokens: listener.code.then((code) =>
          exchangeAuthorizationCode(
            {
              tokenEndpoint,
              clientId: config.oauthClientId,
              redirectUri,
              code,
              codeVerifier: pkce.verifier
            },
            fetchFn
          )
        ),
        cancel: listener.close
      };
    },
    async refresh(refreshToken) {
      const { tokenEndpoint } = await getEndpoints();
      return refreshAccessToken(
        { tokenEndpoint, clientId: config.oauthClientId, refreshToken },
        fetchFn
      );
    },
    async revoke(refreshToken) {
      const { revocationEndpoint } = await getEndpoints();
      if (!revocationEndpoint) {
        return false;
      }
      return revokeToken(
        {
          revocationEndpoint,
          clientId: config.oauthClientId,
          token: refreshToken
        },
        fetchFn
      );
    }
  };
}

type TimedToken = { token: string; expiresAt: number };

export type SignInResult =
  | { status: 'signed-in'; persistent: boolean }
  | { status: 'pending'; authorizeUrl: string };

// Holds the admin's sign-in for one MCP process. Only the Clerk refresh token
// is persisted (through the store); the Clerk access token and the short-lived
// Pacemaker API token stay in memory.
export class AuthSession {
  readonly #config: McpConfig;
  readonly #oauth: OAuthProvider;
  readonly #store: RefreshTokenStore;
  readonly #fetchFn: FetchFn;
  readonly #now: () => number;
  readonly #log: Logger;

  #clerk: TimedToken | undefined;
  #api: TimedToken | undefined;
  #pendingApi: Promise<string> | undefined;
  #pendingLogin: LoginHandle | undefined;

  constructor(input: {
    config: McpConfig;
    oauth: OAuthProvider;
    store: RefreshTokenStore;
    fetchFn?: FetchFn;
    now?: () => number;
    log: Logger;
  }) {
    this.#config = input.config;
    this.#oauth = input.oauth;
    this.#store = input.store;
    this.#fetchFn = input.fetchFn ?? fetch;
    this.#now = input.now ?? Date.now;
    this.#log = input.log;
  }

  async getApiToken(): Promise<string> {
    if (
      this.#api &&
      this.#api.expiresAt - this.#now() > API_TOKEN_REFRESH_MARGIN_MS
    ) {
      return this.#api.token;
    }

    this.#pendingApi ??= this.#obtainApiToken().finally(() => {
      this.#pendingApi = undefined;
    });
    return this.#pendingApi;
  }

  invalidateApiToken() {
    this.#api = undefined;
  }

  async signIn(): Promise<SignInResult> {
    try {
      await this.getApiToken();
      return { status: 'signed-in', persistent: this.#store.isPersistent() };
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return { status: 'pending', authorizeUrl: error.authorizeUrl };
      }
      throw error;
    }
  }

  async signOut(): Promise<{ hadSession: boolean; revoked: boolean }> {
    this.#pendingLogin?.cancel();
    this.#pendingLogin = undefined;
    this.#clerk = undefined;
    this.#api = undefined;

    const refreshToken = await this.#store.get();
    await this.#store.clear();
    const revoked = refreshToken
      ? await this.#oauth.revoke(refreshToken).catch(() => false)
      : false;

    return { hadSession: Boolean(refreshToken), revoked };
  }

  async #obtainApiToken(): Promise<string> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const clerkToken = await this.#getClerkAccessToken();
      const apiToken = await this.#exchangeForApiToken(clerkToken);
      if (apiToken) {
        return apiToken;
      }
      // Clerk access token was rejected; drop it and refresh once.
      this.#clerk = undefined;
    }

    await this.#store.clear();
    return this.#requireSignIn();
  }

  async #exchangeForApiToken(clerkToken: string): Promise<string | null> {
    let response: Response;
    try {
      response = await this.#fetchFn(
        `${this.#config.apiOrigin}/api/mcp/token`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${clerkToken}` },
          redirect: 'manual',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        }
      );
    } catch {
      throw new UserFacingError(
        `Could not reach the Pacemaker API at ${this.#config.apiOrigin}. Is the server running?`
      );
    }

    if (response.status === 401) {
      return null;
    }

    const payload = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (response.status === 403) {
      const reason = typeof payload.error === 'string' ? payload.error : '';
      throw new UserFacingError(
        `Pacemaker refused MCP access${reason ? ` (${reason})` : ''}. Sign in with a Pacemaker admin account.`
      );
    }

    if (response.status === 503) {
      throw new UserFacingError(
        'The Pacemaker MCP token service is not configured on the server.'
      );
    }

    if (
      response.status !== 200 ||
      typeof payload.access_token !== 'string' ||
      typeof payload.expires_in !== 'number'
    ) {
      throw new UserFacingError(
        `Pacemaker token exchange failed (HTTP ${response.status}).`
      );
    }

    this.#api = {
      token: payload.access_token,
      expiresAt: this.#now() + payload.expires_in * 1000
    };
    return payload.access_token;
  }

  async #getClerkAccessToken(): Promise<string> {
    if (
      this.#clerk &&
      this.#clerk.expiresAt - this.#now() > CLERK_TOKEN_REFRESH_MARGIN_MS
    ) {
      return this.#clerk.token;
    }

    const refreshToken = await this.#store.get();
    if (refreshToken) {
      try {
        const tokens = await this.#oauth.refresh(refreshToken);
        await this.#acceptTokens(tokens);
        return tokens.accessToken;
      } catch (error) {
        if (!(error instanceof InvalidGrantError)) {
          throw error;
        }
        await this.#store.clear();
        this.#log(
          'Stored sign-in expired or was revoked; a new sign-in is required.'
        );
      }
    }

    return this.#requireSignIn();
  }

  async #acceptTokens(tokens: OAuthTokens) {
    this.#clerk = {
      token: tokens.accessToken,
      expiresAt: this.#now() + tokens.expiresInSeconds * 1000
    };
    // Clerk rotates refresh tokens; the previous one is now invalid.
    if (tokens.refreshToken) {
      await this.#store.set(tokens.refreshToken);
    }
  }

  // Starts a browser sign-in in the background and returns at once, so the
  // tool call does not outlive the MCP host's request timeout.
  async #requireSignIn(): Promise<never> {
    if (this.#pendingLogin) {
      throw new SignInRequiredError(this.#pendingLogin.authorizeUrl, true);
    }

    const login = await this.#oauth.startLogin();
    this.#pendingLogin = login;
    login.tokens
      .then((tokens) => this.#acceptTokens(tokens))
      .then(() => this.#log('Signed in to Pacemaker.'))
      .catch((error: unknown) => {
        this.#log(
          `Sign-in did not complete: ${error instanceof UserFacingError ? error.message : 'unexpected error'}`
        );
      })
      .finally(() => {
        if (this.#pendingLogin === login) {
          this.#pendingLogin = undefined;
        }
      });

    throw new SignInRequiredError(login.authorizeUrl, false);
  }
}
