'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInWithGoogleButton from '@/components/auth/sign-in-google-button';

type Props = {
  closeModal?: () => void;
  switchToSignUp?: () => void; // 전환 콜백
};

type SignInAttemptResult = {
  status:
    | 'needs_identifier'
    | 'needs_first_factor'
    | 'needs_second_factor'
    | 'needs_new_password'
    | 'complete'
    | null;
  supportedSecondFactors?: Array<{
    strategy: string;
    emailAddressId?: string;
    safeIdentifier?: string;
  }> | null;
  createdSessionId: string | null;
};

export default function CustomSignIn({ closeModal, switchToSignUp }: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [secondFactorEmail, setSecondFactorEmail] = useState('');
  const [secondFactorEmailId, setSecondFactorEmailId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const finishSignIn = async (sessionId: string | null) => {
    if (!sessionId) {
      setError('Could not create login session. Please try again.');
      return;
    }

    if (!setActive) {
      setError('Could not activate login session. Please try again.');
      return;
    }

    await setActive({ session: sessionId });
    closeModal?.();
    router.push('/');
  };

  const prepareEmailSecondFactor = async (
    currentSignIn: NonNullable<typeof signIn>,
    result: SignInAttemptResult
  ) => {
    const emailCodeFactor = result.supportedSecondFactors?.find(
      (factor) => factor.strategy === 'email_code'
    );

    if (!emailCodeFactor) {
      setError('No supported email verification method found.');
      return;
    }

    await currentSignIn.prepareSecondFactor({
      strategy: 'email_code',
      ...(emailCodeFactor.emailAddressId
        ? { emailAddressId: emailCodeFactor.emailAddressId }
        : {})
    });

    setSecondFactorEmail(emailCodeFactor.safeIdentifier ?? email);
    setSecondFactorEmailId(emailCodeFactor.emailAddressId ?? '');
    setCode('');
    setIsVerifyingCode(true);
    setError('');
    setNotice('A verification code has been sent to your email.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        strategy: 'password',
        identifier: email,
        password: pw
      });

      if (result.status === 'complete') {
        await finishSignIn(result.createdSessionId);
      } else if (result.status === 'needs_second_factor') {
        await prepareEmailSecondFactor(signIn, result);
      } else if (result.status === 'needs_new_password') {
        setError('Please set a new password.');
      } else {
        setError('Additional verification required to finish signing in.');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { code?: string; message?: string }[] };
      setError(
        e.errors?.[0]?.message ||
          'Sign in failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySecondFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: code.trim()
      });

      if (result.status === 'complete') {
        await finishSignIn(result.createdSessionId);
      } else {
        setError('Could not complete verification. Please check the code.');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      setError(
        e.errors?.[0]?.message || 'Failed to verify code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendSecondFactor = async () => {
    if (!isLoaded || !signIn) return;

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      await signIn.prepareSecondFactor({
        strategy: 'email_code',
        ...(secondFactorEmailId ? { emailAddressId: secondFactorEmailId } : {})
      });
      setNotice('A new verification code has been sent.');
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      setError(
        e.errors?.[0]?.message ||
          'Failed to resend verification code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifyingCode) {
    return (
      <div className="space-y-[23px]">
        <h2 className="text-[24px] font-bold text-center tracking-tight font-heading leading-tight text-navy">
          Two-step verification
        </h2>
        <p className="text-sm text-center text-body">
          Please enter the code sent to {secondFactorEmail || email}.
        </p>
        <form onSubmit={handleVerifySecondFactor}>
          <div className="space-y-[23px]">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Verification code"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400"
              required
            />
          </div>
          {notice && (
            <p className="text-sm text-center text-gray-500 mt-2">{notice}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full min-h-[44px] items-center justify-center gap-2 bg-orange hover:bg-orange-hover text-white font-bold text-base font-heading rounded-2xl py-4 shadow-[0_4px_12px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 mt-[40px]"
          >
            VERIFY &amp; SIGN IN
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleResendSecondFactor}
            disabled={isSubmitting}
            className="text-sm font-semibold text-body underline hover:text-orange transition-colors"
          >
            Resend verification code
          </button>
          <button
            type="button"
            onClick={() => {
              setIsVerifyingCode(false);
              setCode('');
              setNotice('');
              setError('');
            }}
            className="text-sm text-gray-400 hover:text-navy transition-colors"
          >
            Back to email sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="login-flow" className="space-y-[23px]">
      <h2 className="text-[24px] font-bold text-center tracking-tight font-heading leading-tight text-navy whitespace-nowrap">
        Sign in to Pacemaker
      </h2>

      <SignInWithGoogleButton />

      <div className="text-center font-bold text-sm tracking-[0.18em] font-heading text-navy">
        OR
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-[23px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400"
            required
          />
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full min-h-[44px] items-center justify-center gap-2 bg-orange hover:bg-orange-hover text-white font-bold text-base font-heading rounded-2xl py-4 shadow-[0_4px_12px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 mt-[40px]"
        >
          CONTINUE
        </button>
      </form>

      <div className="text-center text-sm text-body mt-[40px]">
        Don&apos;t have an account?
        <button
          type="button"
          onClick={() => {
            switchToSignUp?.();
          }}
          className="font-semibold text-navy underline ml-1 hover:text-orange transition-colors cursor-pointer"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
