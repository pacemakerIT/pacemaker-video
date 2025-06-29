'use client';

import { useSignIn } from '@clerk/nextjs';
import Image from 'next/image';
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
      toast.error('구글 회원가입에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignUp}
      className="w-[400px] h-[50px] flex items-center justify-center gap-2 px-[16px] pr-[13px] border border-[#777777] rounded-full bg-white mb-6"
    >
      <Image
        src="/icons/google.svg"
        alt="구글 아이콘"
        width={24}
        height={24}
        className="min-w-[24px] min-h-[24px]"
        priority
      />
      <span className="text-pace-base leading-[1.4] text-pace-gray-500 font-normal">
        구글 계정으로 시작하기
      </span>
    </button>
  );
}
