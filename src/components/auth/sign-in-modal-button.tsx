'use client';

import { useState } from 'react';
import CustomSignIn from '@/components/auth/custom-sign-in';
import { Dialog } from '@headlessui/react';
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

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50 font-sans"
      >
        {/* 배경 어둡게 */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* 모달 중앙 정렬 */}
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-[480px] bg-white rounded-lg shadow-xl px-10 py-10 flex flex-col gap-10">
            <Dialog.Title className="text-pace-xl font-bold text-center text-pace-black-500">
              로그인
            </Dialog.Title>

            <CustomSignIn closeModal={() => setIsOpen(false)} />

            <button
              onClick={() => setIsOpen(false)}
              className="text-pace-sm text-pace-gray-500 hover:underline text-center"
            >
              닫기
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
