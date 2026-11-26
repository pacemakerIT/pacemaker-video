import { describe, expect, it } from 'vitest';
import {
  RESET_ERRORS,
  isIdentifierNotFound,
  mapResetError
} from '@/lib/auth-errors';

const clerkError = (code: string, status?: number) => ({
  status,
  errors: [{ code, message: 'raw clerk message' }]
});

describe('mapResetError', () => {
  it.each([
    ['form_code_incorrect', RESET_ERRORS.wrongCode],
    ['verification_expired', RESET_ERRORS.expiredCode],
    ['form_password_pwned', RESET_ERRORS.breachedPassword],
    ['form_password_length_too_short', RESET_ERRORS.shortPassword],
    ['strategy_for_user_invalid', RESET_ERRORS.googleOnly],
    ['form_param_format_invalid', RESET_ERRORS.invalidEmail]
  ])('maps %s to our copy', (code, expected) => {
    expect(mapResetError(clerkError(code))).toEqual(expected);
  });

  it('treats HTTP 429 as too many attempts', () => {
    expect(mapResetError(clerkError('anything', 429))).toEqual(
      RESET_ERRORS.tooMany
    );
  });

  it('never shows raw Clerk messages for unknown errors', () => {
    expect(mapResetError(clerkError('something_new'))).toEqual(
      RESET_ERRORS.generic
    );
    expect(mapResetError(new Error('network down'))).toEqual(
      RESET_ERRORS.generic
    );
  });
});

describe('isIdentifierNotFound', () => {
  it('detects unknown emails so the UI can hide them', () => {
    expect(isIdentifierNotFound(clerkError('form_identifier_not_found'))).toBe(
      true
    );
    expect(isIdentifierNotFound(clerkError('form_code_incorrect'))).toBe(false);
  });
});
