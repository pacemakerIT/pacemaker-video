// components/auth/custom-sign-in-wrapper.tsx
'use client';

import CustomSignIn from './custom-sign-in';

type Props = {
  isPage?: boolean;
  closeModal?: () => void;
};

export default function CustomSignInWrapper({
  isPage = true,
  closeModal
}: Props) {
  const content = (
    <div className="p-6 bg-white rounded w-full max-w-[520px]">
      <h1 className="text-pace-xl font-semibold text-pace-black-500 text-center mb-4">
        로그인
      </h1>
      <CustomSignIn closeModal={closeModal} />
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
