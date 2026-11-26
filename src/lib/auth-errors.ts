// User-facing copy for the password reset flow.
// Wording follows .agent/english-copy-guide.md and public/html/modals/auth.html.

export type ResetErrorField =
  'email' | 'code' | 'password' | 'confirm' | 'form';

export type ResetError = {
  field: ResetErrorField;
  message: string;
};

export const RESET_ERRORS = {
  invalidEmail: {
    field: 'email',
    message: 'Enter a valid email address.'
  },
  googleOnly: {
    field: 'email',
    message: 'This account uses Google sign-in. Log in with Google instead.'
  },
  tooMany: {
    field: 'form',
    message: 'Too many attempts. Try again in a few minutes.'
  },
  incompleteCode: {
    field: 'code',
    message: 'Enter the 6-digit code from your email.'
  },
  wrongCode: {
    field: 'code',
    message: "That code isn't right. Check your email and try again."
  },
  expiredCode: {
    field: 'code',
    message: 'This code has expired. Request a new one below.'
  },
  shortPassword: {
    field: 'password',
    message: 'Use at least 8 characters.'
  },
  breachedPassword: {
    field: 'password',
    message: 'This password showed up in a data breach. Choose a different one.'
  },
  weakPassword: {
    field: 'password',
    message: 'Choose a stronger password.'
  },
  mismatch: {
    field: 'confirm',
    message: "Passwords don't match."
  },
  generic: {
    field: 'form',
    message: 'Something went wrong. Please try again.'
  }
} as const satisfies Record<string, ResetError>;

export const MIN_PASSWORD_LENGTH = 8;

type ClerkLikeError = {
  status?: number;
  errors?: { code?: string; message?: string }[];
};

export function getClerkErrorCode(err: unknown): string | undefined {
  return (err as ClerkLikeError)?.errors?.[0]?.code;
}

/** True when Clerk says the email has no account. We hide this from the UI. */
export function isIdentifierNotFound(err: unknown): boolean {
  return getClerkErrorCode(err) === 'form_identifier_not_found';
}

/** Maps a Clerk error from the reset flow to the copy and field it belongs to. */
export function mapResetError(err: unknown): ResetError {
  const code = getClerkErrorCode(err);
  const status = (err as ClerkLikeError)?.status;

  if (status === 429 || code === 'too_many_requests') {
    return RESET_ERRORS.tooMany;
  }

  switch (code) {
    case 'form_param_format_invalid':
    case 'form_identifier_invalid':
      return RESET_ERRORS.invalidEmail;
    // The account has no password (e.g. it was created with Google).
    case 'strategy_for_user_invalid':
    case 'form_password_not_set':
      return RESET_ERRORS.googleOnly;
    case 'form_code_incorrect':
      return RESET_ERRORS.wrongCode;
    case 'verification_expired':
      return RESET_ERRORS.expiredCode;
    case 'verification_failed':
      return RESET_ERRORS.tooMany;
    case 'form_password_length_too_short':
      return RESET_ERRORS.shortPassword;
    case 'form_password_pwned':
      return RESET_ERRORS.breachedPassword;
    case 'form_password_not_strong_enough':
    case 'form_password_validation_failed':
      return RESET_ERRORS.weakPassword;
    default:
      return RESET_ERRORS.generic;
  }
}
