'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import SignUpWithGoogleButton from '@/components/auth/sign-up-google-button';

type Props = {
  closeModal?: () => void;
  switchToSignIn?: () => void;
};

export default function CustomSignUp({ closeModal, switchToSignIn }: Props) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await signUp.create({
        emailAddress: email,
        password: pw,
        unsafeMetadata: {
          firstName: first_name,
          lastName: last_name
        }
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code'
      });
      setPendingVerification(true);
    } catch (err: unknown) {
      const errorObj = err as {
        errors?: { code?: string; message?: string }[];
      };

      const errorList = errorObj?.errors ?? [];

      const emailExistsError = errorList.find(
        (item) => item.code === 'form_identifier_exists'
      );

      if (emailExistsError) {
        const msg = 'That email is already registered. Please log in.';
        setError(msg);
        toast.error(msg);
      } else {
        const fallbackMessage =
          errorList[0]?.message || 'An error occurred during registration.';
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim()
      });
      await setActive({ session: completeSignUp.createdSessionId });
      closeModal?.();
      router.push('/');
    } catch (err: unknown) {
      const errorObj = err as {
        errors?: { message?: string }[];
      };
      const msg =
        errorObj?.errors?.[0]?.message || 'Failed to verify email code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="space-y-[23px]">
        <h2 className="text-[24px] font-bold text-center tracking-tight font-heading leading-tight text-navy">
          Verify your email
        </h2>
        <p className="text-sm text-center text-body">
          A verification code has been sent to {email}.
        </p>

        <form onSubmit={handleVerify}>
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

          {error && (
            <p className="text-red-500 text-sm text-center mt-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full min-h-[44px] items-center justify-center gap-2 bg-orange hover:bg-orange-hover text-white font-bold text-base font-heading rounded-2xl py-4 shadow-[0_4px_12px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 mt-[40px]"
          >
            VERIFY EMAIL
          </button>
        </form>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setPendingVerification(false);
              setError('');
            }}
            className="text-sm text-gray-400 hover:text-navy transition-colors"
          >
            Back to sign up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="signup-flow" className="space-y-[23px]">
      <h2 className="text-[24px] font-bold text-center tracking-tight font-heading leading-tight text-navy whitespace-nowrap">
        Create your account
      </h2>

      <SignUpWithGoogleButton />

      <div className="text-center font-bold text-sm tracking-[0.18em] font-heading text-navy">
        OR
      </div>

      <form onSubmit={handleSignUp}>
        <div className="space-y-[23px]">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="First name"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400"
            />
            <input
              type="text"
              required
              placeholder="Last name"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400"
            />
          </div>

          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange placeholder-gray-400"
          />
        </div>

        {/* CAPTCHA */}
        <div
          id="clerk-captcha"
          data-cl-theme="auto"
          data-cl-size="flexible"
          data-cl-language="en"
          className="mt-6 !mb-0 !pb-0"
          style={{ marginBottom: '0px', paddingBottom: '0px' }}
        />

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
        Already have an account?
        <button
          type="button"
          onClick={() => {
            switchToSignIn?.();
          }}
          className="font-semibold text-navy underline ml-1 hover:text-orange transition-colors cursor-pointer"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
