'use client';

import { useSignIn } from '@clerk/nextjs/legacy';
import { useState } from 'react';
import { Check } from 'lucide-react';
import CodeInput from '@/components/auth/code-input';
import {
  MIN_PASSWORD_LENGTH,
  RESET_ERRORS,
  isIdentifierNotFound,
  mapResetError,
  type ResetError
} from '@/lib/auth-errors';
import { cn } from '@/lib/utils';

const STRATEGY = 'reset_password_email_code' as const;
const CODE_LENGTH = 6;

type SignInResult = NonNullable<ReturnType<typeof useSignIn>['signIn']>;

type Props = {
  initialEmail?: string;
  /** Back to the sign-in form. */
  onBack: () => void;
  /** Reset worked but the account also needs a second factor. */
  onNeedsSecondFactor: (result: SignInResult) => Promise<void> | void;
  /** User pressed Continue on the done screen (session is already active). */
  onFinish: () => void;
};

type Step = 'email' | 'reset' | 'done';

const inputClass =
  'w-full border rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400';
const primaryButtonClass =
  'flex w-full min-h-[44px] items-center justify-center gap-2 bg-orange hover:bg-orange-hover text-white font-bold text-base font-[family-name:var(--font-heading)] rounded-2xl py-4 shadow-[0_4px_12px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 mt-[40px]';
const linkButtonClass =
  'font-semibold text-navy underline hover:text-orange transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70';
const headingClass =
  'text-[24px] font-bold tracking-tight font-heading leading-tight text-navy';

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm text-orange">
      {error}
    </p>
  );
}

export default function ForgotPassword({
  initialEmail = '',
  onBack,
  onNeedsSecondFactor,
  onFinish
}: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<ResetError | null>(null);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // False when the email has no account: we still show the code step so
  // nobody can tell which emails are registered, but there is nothing to send.
  const [hasResetAttempt, setHasResetAttempt] = useState(false);

  const errorFor = (field: ResetError['field']) =>
    error?.field === field ? error.message : undefined;

  const sendCode = async () => {
    if (!isLoaded || !signIn) return false;
    try {
      await signIn.create({ strategy: STRATEGY, identifier: email.trim() });
      setHasResetAttempt(true);
      return true;
    } catch (err) {
      if (isIdentifierNotFound(err)) {
        setHasResetAttempt(false);
        return true;
      }
      setError(mapResetError(err));
      return false;
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice('');
    setIsSubmitting(true);
    try {
      if (await sendCode()) {
        setCode('');
        setStep('reset');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setNotice('');
    setIsSubmitting(true);
    try {
      if (await sendCode()) {
        setCode('');
        setNotice('We sent a new code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeSignIn = async (sessionId: string | null) => {
    if (!sessionId || !setActive) {
      setError(RESET_ERRORS.generic);
      return;
    }
    await setActive({ session: sessionId });
    setStep('done');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError(null);
    setNotice('');

    if (code.length < CODE_LENGTH) return setError(RESET_ERRORS.incompleteCode);
    if (password.length < MIN_PASSWORD_LENGTH)
      return setError(RESET_ERRORS.shortPassword);
    if (password !== confirm) return setError(RESET_ERRORS.mismatch);
    if (!hasResetAttempt) return setError(RESET_ERRORS.wrongCode);

    setIsSubmitting(true);
    try {
      let result = await signIn.attemptFirstFactor({
        strategy: STRATEGY,
        code,
        password
      });

      if (result.status === 'needs_new_password') {
        result = await result.resetPassword({ password });
      }

      if (result.status === 'complete') {
        await completeSignIn(result.createdSessionId);
      } else if (
        result.status === 'needs_second_factor' ||
        result.status === 'needs_client_trust'
      ) {
        await onNeedsSecondFactor(result);
      } else {
        setError(RESET_ERRORS.generic);
      }
    } catch (err) {
      setError(mapResetError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="space-y-[23px]">
        <div className="flex justify-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal"
            aria-hidden
          >
            <Check className="h-8 w-8" />
          </span>
        </div>
        <div className="space-y-3 text-center">
          <h2 className={headingClass}>Password updated</h2>
          <p className="text-base leading-relaxed text-body">
            You&apos;re logged in with your new password.
          </p>
        </div>
        <button type="button" onClick={onFinish} className={primaryButtonClass}>
          CONTINUE
        </button>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="space-y-[23px]">
        <div className="space-y-3 text-center">
          <h2 className={headingClass}>Check your email</h2>
          <p className="text-base leading-relaxed text-body">
            We sent a code to{' '}
            <span className="font-semibold text-navy">{email.trim()}</span>.
          </p>
        </div>

        <form onSubmit={handleReset} noValidate>
          <div className="space-y-[23px]">
            <div>
              <CodeInput
                value={code}
                onChange={setCode}
                length={CODE_LENGTH}
                hasError={Boolean(errorFor('code'))}
                disabled={isSubmitting}
                describedBy="reset-code-error"
                autoFocus
              />
              <FieldError id="reset-code-error" error={errorFor('code')} />
              {notice && (
                <p role="status" className="mt-2 text-sm text-teal">
                  {notice}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                aria-label="New password"
                aria-invalid={Boolean(errorFor('password')) || undefined}
                aria-describedby="reset-password-error"
                className={cn(
                  inputClass,
                  errorFor('password') ? 'border-orange' : 'border-gray-300'
                )}
              />
              {errorFor('password') ? (
                <FieldError
                  id="reset-password-error"
                  error={errorFor('password')}
                />
              ) : (
                <p className="mt-2 text-sm text-body">
                  At least {MIN_PASSWORD_LENGTH} characters.
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                aria-label="Confirm new password"
                aria-invalid={Boolean(errorFor('confirm')) || undefined}
                aria-describedby="reset-confirm-error"
                className={cn(
                  inputClass,
                  errorFor('confirm') ? 'border-orange' : 'border-gray-300'
                )}
              />
              <FieldError
                id="reset-confirm-error"
                error={errorFor('confirm')}
              />
            </div>
          </div>

          <FieldError id="reset-form-error" error={errorFor('form')} />

          <button
            type="submit"
            disabled={isSubmitting}
            className={primaryButtonClass}
          >
            RESET PASSWORD
          </button>
        </form>

        <div className="mt-[40px] space-y-2 text-center text-sm text-body">
          <div>
            Didn&apos;t get a code?
            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting}
              className={cn(linkButtonClass, 'ml-1')}
            >
              Resend
            </button>
          </div>
          <button type="button" onClick={onBack} className={linkButtonClass}>
            Back to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[23px]">
      <div className="space-y-3 text-center">
        <h2 className={headingClass}>Reset your password</h2>
        <p className="text-base leading-relaxed text-body">
          Enter your email. We&apos;ll send you a {CODE_LENGTH}-digit code.
        </p>
      </div>

      <form onSubmit={handleSendCode}>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          aria-invalid={Boolean(errorFor('email')) || undefined}
          aria-describedby="forgot-email-error"
          className={cn(
            inputClass,
            errorFor('email') ? 'border-orange' : 'border-gray-300'
          )}
        />
        <FieldError
          id="forgot-email-error"
          error={errorFor('email') ?? errorFor('form')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={primaryButtonClass}
        >
          SEND CODE
        </button>
      </form>

      <div className="mt-[40px] text-center text-sm text-body">
        Remember your password?
        <button
          type="button"
          onClick={onBack}
          className={cn(linkButtonClass, 'ml-1')}
        >
          Log in
        </button>
      </div>
    </div>
  );
}
