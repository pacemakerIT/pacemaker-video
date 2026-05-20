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
        <Link href="/courses" className="w-full flex justify-center sm:w-auto">
          <button className="w-1/2 sm:w-auto h-14 bg-orange text-white border-2 border-orange px-8 rounded-2xl flex justify-center items-center font-bold hover:bg-orange-hover transition-colors">
            Start learning
          </button>
        </Link>
      ) : (
        <button
          onClick={() => setIsSignInModalOpen(true)}
          className="w-1/2 sm:w-auto h-14 bg-orange text-white border-2 border-orange px-8 rounded-2xl flex justify-center items-center font-bold hover:bg-orange-hover transition-colors"
        >
          Log in and start learning
        </button>
      )}
    </>
  );
}
