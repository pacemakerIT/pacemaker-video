'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  closeModal?: () => void;
};

export default function CustomSignIn({ closeModal }: Props) {
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 font-sans text-pace-base"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소"
        className="rounded-full border border-pace-gray-200 px-4 py-3 placeholder-pace-gray-500 text-pace-black-500"
        required
      />
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="비밀번호"
        className="rounded-full border border-pace-gray-200 px-4 py-3 placeholder-pace-gray-500 text-pace-black-500"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-pace-orange-800 hover:bg-pace-orange-600 text-white py-3 rounded-full text-pace-base"
      >
        로그인 하기
      </button>
    </form>
  );
}
