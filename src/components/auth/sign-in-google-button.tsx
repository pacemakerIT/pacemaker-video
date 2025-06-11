'use client';

import { useSignIn } from '@clerk/nextjs';
import Image from 'next/image';
import { toast } from 'sonner';

type Props = {
  returnUrl?: string;
};

// returnUrl 예시 <SignInWithGoogleButton returnUrl="/mypage" />
export default function SignInWithGoogleButton({ returnUrl }: Props) {
  const { isLoaded, signIn } = useSignIn();

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback', // Clerk가 중간 인증 redirect를 수행할 곳
        redirectUrlComplete: returnUrl ?? '/' // returnUrl 있으면 사용, 없으면 '/'
      });

      // redirect happens, so no need for setActive or router.push here
    } catch {
      toast.error('구글 로그인에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
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
        구글계정으로 로그인
      </span>
    </button>
  );
}
