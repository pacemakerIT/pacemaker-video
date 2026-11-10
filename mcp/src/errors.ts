// Errors whose message is safe to show to the admin through the MCP host.
// Messages must never include tokens, codes, or verifiers.
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}

export class SignInRequiredError extends UserFacingError {
  readonly authorizeUrl: string;

  constructor(authorizeUrl: string, alreadyPending: boolean) {
    super(
      alreadyPending
        ? `Pacemaker sign-in is still in progress. Finish signing in at ${authorizeUrl} and then run this request again.`
        : `Pacemaker sign-in is required. A browser window was opened; if it did not appear, open ${authorizeUrl}. After signing in, run this request again.`
    );
    this.name = 'SignInRequiredError';
    this.authorizeUrl = authorizeUrl;
  }
}

// The stored refresh token was rejected (expired, revoked, or already rotated).
export class InvalidGrantError extends Error {
  constructor() {
    super('OAuth grant is no longer valid.');
    this.name = 'InvalidGrantError';
  }
}
