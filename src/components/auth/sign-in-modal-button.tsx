'use client';

import { useState } from 'react';
import SignInModal from '@/components/auth/sign-in-modal';
import Image from 'next/image';

export default function SignInModalButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-pace-base font-normal text-pace-orange-800 hover:text-pace-orange-600"
      >
        <Image
          src="/icons/login.svg"
          alt="로그인 아이콘"
          width={24}
          height={24}
          className="align-middle"
        />
        로그인
      </button>

      <SignInModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
