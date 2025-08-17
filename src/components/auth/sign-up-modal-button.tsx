'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import CustomAuthWrapper from '@/components/auth/custom-auth-wrapper';

export default function SignUpModalButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-pace-base font-normal text-pace-gray-700 hover:text-pace-orange-800"
      >
        회원가입
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50 font-sans"
      >
        {/* 배경 */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* 모달 */}
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
            {/* Wrapper에서 로그인/회원가입 전환 관리 */}
            <CustomAuthWrapper
              isPage={false}
              initialMode="signup" // 회원가입 모드로 시작
              closeModal={() => setIsOpen(false)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
