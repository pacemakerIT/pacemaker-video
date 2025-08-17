'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import CustomAuthWrapper from '@/components/auth/custom-auth-wrapper';

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

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50 font-sans"
      >
        {/* 배경 어둡게 */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* 모달 중앙 정렬 */}
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel
            className="
              w-full max-w-[480px]
              bg-white rounded-lg shadow-xl
              px-6 py-10
              sm:px-10 sm:py-16
              md:px-[40px] md:py-[80px]
              flex flex-col gap-6
            "
          >
            {/* Wrapper로 교체 */}
            <CustomAuthWrapper
              isPage={false}
              initialMode="signin" // 로그인 모드로 시작
              closeModal={() => setIsOpen(false)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
