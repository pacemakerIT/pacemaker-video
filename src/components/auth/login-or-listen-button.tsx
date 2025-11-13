'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginOrListenButton() {
  const { userId } = useAuth();
  const [, setIsSignInModalOpen] = useState(false);

  return (
    <>
      {userId ? (
        <Link href="/courses">
          <button className="h-12 bg-pace-orange-600 text-white border border-pace-orange-600 p-4 rounded-full flex justify-center items-center mx-auto font-normal">
            강의 보러가기
          </button>
        </Link>
      ) : (
        <button
          onClick={() => setIsSignInModalOpen(true)}
          className="h-12 bg-pace-orange-600 text-white border border-pace-orange-600 p-4 rounded-full flex justify-center items-center mx-auto font-normal"
        >
          로그인하고 강의 듣기
        </button>
      )}
    </>
  );
}
