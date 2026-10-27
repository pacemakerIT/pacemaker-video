'use client';

import { Dialog } from '@headlessui/react';
import CustomAuthWrapper from '@/components/auth/custom-auth-wrapper';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 font-sans">
      {/* 배경 어둡게 */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* 모달 중앙 정렬 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[480px] flex items-center justify-center">
          <CustomAuthWrapper
            isPage={false}
            closeModal={onClose}
            initialMode="signin"
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
