'use client';

import { useState } from 'react';
import CustomSignIn from './custom-sign-in';
import CustomSignUp from './custom-sign-up';

type Props = {
  isPage?: boolean;
  closeModal?: () => void;
  initialMode?: 'signin' | 'signup';
};

export default function CustomSignInWrapper({
  isPage = true,
  closeModal,
  initialMode = 'signin'
}: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  const content = (
    <div className="p-6 bg-white rounded w-full max-w-[520px]">
      <h1 className="text-pace-xl font-semibold text-pace-black-500 text-center mb-4">
        {mode === 'signin' ? '로그인' : '회원가입'}
      </h1>

      {mode === 'signin' ? (
        <CustomSignIn
          closeModal={closeModal}
          switchToSignUp={() => {
            // eslint-disable-next-line no-console
            console.log('Wrapper setMode → signup');
            setMode('signup'); // ← 여기서 전환!
          }}
        />
      ) : (
        <CustomSignUp
          closeModal={closeModal}
          switchToSignIn={() => {
            // eslint-disable-next-line no-console
            console.log('Wrapper setMode → signin');
            setMode('signin');
          }}
        />
      )}
    </div>
  );

  return isPage ? (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {content}
    </div>
  ) : (
    content
  );
}
