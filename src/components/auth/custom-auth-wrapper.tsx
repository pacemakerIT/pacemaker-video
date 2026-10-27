'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import CustomSignIn from './custom-sign-in';
import CustomSignUp from './custom-sign-up';

type Props = {
  isPage?: boolean;
  closeModal?: () => void;
  initialMode?: 'signin' | 'signup';
};

export default function CustomAuthWrapper({
  isPage = true,
  closeModal,
  initialMode = 'signin'
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  const handleClose = () => {
    if (closeModal) {
      closeModal();
    } else if (isPage) {
      router.push('/');
    }
  };

  const cardContent = (
    <div className="bg-white rounded-none border border-gray-100 shadow-card w-full max-w-[480px] relative z-10 px-6 sm:px-10 pt-[80px] pb-[48px] sm:py-[80px] text-navy font-body">
      {/* Close Button: Sized to w-11 h-11 (44px) for WCAG accessibility touch targets */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-6 top-6 w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-soft transition-colors cursor-pointer"
        aria-label="Close modal"
      >
        <X className="w-5 h-5" />
      </button>

      {mode === 'signin' ? (
        <CustomSignIn
          closeModal={closeModal}
          switchToSignUp={() => {
            setMode('signup');
          }}
        />
      ) : (
        <CustomSignUp
          closeModal={closeModal}
          switchToSignIn={() => {
            setMode('signin');
          }}
        />
      )}
    </div>
  );

  return isPage ? (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-body bg-[#f9fafb]">
      {/* Background Backdrop Link: Clicking backdrop redirects to main page */}
      <Link
        href="/"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"
        aria-label="Close modal and return to main page"
      />
      {cardContent}
    </div>
  ) : (
    cardContent
  );
}
