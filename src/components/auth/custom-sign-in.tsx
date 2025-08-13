'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInWithGoogleButton from '@/components/auth/sign-in-google-button';
import CustomSignUpWrapper from '@/components/auth/custom-sign-up-wrapper'; // 래퍼 사용
import { createPortal } from 'react-dom'; // 포털로 렌더링

type Props = {
  closeModal?: () => void;
};

export default function CustomSignIn({ closeModal }: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false); // 회원가입 모달 상태

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({ identifier: email, password: pw });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        closeModal?.();
        router.push('/');
      } else {
        setError('추가 인증이 필요합니다.');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      setError(e.errors?.[0]?.message || '로그인 실패');
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-pace-base">
      <SignInWithGoogleButton />
      <p className="w-[400px] text-pace-base font-bold text-pace-black-500 text-center mb-6">
        혹은
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 text-pace-base leading-[1.4] font-normal placeholder-pace-stone-800 mb-6"
          required
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 text-pace-base leading-[1.4] font-normal placeholder-pace-stone-800 mb-0"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="
            w-full
            bg-pace-orange-800 hover:bg-pace-orange-600
            text-white text-pace-base font-medium rounded-full
            py-3
            mt-6 mb-6
            sm:mt-8 sm:mb-8
            md:mt-[40px] md:mb-[40px]
          "
        >
          로그인 하기
        </button>
      </form>

      <p className="text-pace-base font-normal text-pace-stone-500 text-center">
        회원이 아니신가요?{' '}
        <button
          onClick={() => setShowSignUp(true)}
          className="text-pace-gray-500 underline hover:text-pace-orange-800"
        >
          회원가입 하기
        </button>
      </p>

      {/* 회원가입 모달: 래퍼 사용 (createPortal) */}
      {showSignUp &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
            onClick={() => setShowSignUp(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-[480px] bg-white rounded-lg shadow-xl px-6 py-10 sm:px-10 sm:py-16 md:px-[40px] md:py-[80px] flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CustomSignUpWrapper
                isPage={false}
                closeModal={() => setShowSignUp(false)}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
