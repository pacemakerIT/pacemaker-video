'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import CustomSignUp from '@/components/auth/custom-sign-up';

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
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-[480px] bg-white rounded-lg shadow-xl px-6 py-10 sm:px-10 sm:py-16 md:px-[40px] md:py-[80px] flex flex-col gap-6">
            <Dialog.Title className="text-pace-xl font-bold text-center text-pace-black-500">
              회원가입
            </Dialog.Title>
            <CustomSignUp closeModal={() => setIsOpen(false)} />
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
