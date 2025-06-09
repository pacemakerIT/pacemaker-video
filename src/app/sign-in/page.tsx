'use client';

import CustomSignIn from '@/components/auth/custom-sign-in';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 bg-white shadow rounded">
        <h1 className="text-pace-xl font-semibold text-pace-black-500 text-center">
          로그인
        </h1>
        <CustomSignIn />
      </div>
    </div>
  );
}
