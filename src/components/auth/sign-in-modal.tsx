'use client';

import { Dialog } from '@headlessui/react';
import CustomSignIn from '@/components/auth/custom-sign-in';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 font-sans">
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
          <Dialog.Title className="text-pace-xl font-bold text-center text-pace-black-500">
            로그인
          </Dialog.Title>
          <CustomSignIn closeModal={onClose} />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
