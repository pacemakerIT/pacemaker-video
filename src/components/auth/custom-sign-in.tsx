'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInWithGoogleButton from '@/components/auth/sign-in-google-button';

type Props = {
  closeModal?: () => void;
  switchToSignUp?: () => void; // 전환 콜백
};

export default function CustomSignIn({ closeModal, switchToSignUp }: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

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
          className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 mb-6"
          required
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 mb-0"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-pace-orange-800 hover:bg-pace-orange-600 text-white rounded-full py-3 mt-6 mb-6"
        >
          로그인 하기
        </button>
      </form>

      <p className="text-pace-base font-normal text-pace-stone-500 text-center">
        회원이 아니신가요?{' '}
        <button
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('switchToSignUp clicked');
            switchToSignUp?.(); // ← 여기서 Wrapper의 setMode('signup') 호출
          }}
          className="text-pace-gray-500 underline hover:text-pace-orange-800"
        >
          회원가입 하기
        </button>
      </p>
    </div>
  );
}
