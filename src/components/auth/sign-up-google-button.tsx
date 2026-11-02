'use client';

import { useSignIn } from '@clerk/nextjs';
import { toast } from 'sonner';

type Props = {
  returnUrl?: string;
};

export default function SignUpWithGoogleButton({ returnUrl }: Props) {
  const { isLoaded, signIn } = useSignIn();

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: returnUrl ?? '/'
      });
    } catch {
      toast.error('Google sign-up failed. Please try again.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignUp}
      className="w-full min-h-[44px] border border-gray-300 hover:bg-gray-50 text-navy font-bold py-4 px-3 sm:px-6 rounded-2xl text-base font-heading transition-all hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer"
    >
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.97 1 12 1 7.35 1 3.4 3.65 1.56 7.56l3.86 3C6.35 7.67 8.93 5.04 12 5.04z"
        />
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.81-.07-1.59-.2-2.33H12v4.42h6.43c-.28 1.44-1.1 2.66-2.33 3.47v2.88h3.77c2.2-2.02 3.62-5 3.62-8.44z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.23-.69-.35-1.43-.35-2.2s.13-1.51.35-2.2V6.69H1.98C1.21 8.24.77 9.97.77 11.8s.44 3.56 1.21 5.11l3.86-3z"
        />
        <path
          fill="#34A853"
          d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.77-2.88c-1.04.7-2.38 1.12-4.19 1.12-3.07 0-5.65-2.07-6.58-4.86H1.56v3.08C3.4 20.35 7.35 23 12 23z"
        />
      </svg>
      <span className="whitespace-nowrap">Continue with google</span>
    </button>
  );
}
