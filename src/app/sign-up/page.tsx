'use client';

import CustomSignUp from '@/components/auth/custom-sign-up';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 bg-white shadow rounded">
        <h1 className="text-pace-xl font-semibold text-pace-black-500 text-center">
          회원가입
        </h1>
        <CustomSignUp />
      </div>
    </div>
  );
}
