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
        <Link href="/courses" className="flex justify-center">
          <button className="inline-flex items-center justify-center rounded-2xl bg-orange px-8 py-4 font-headline text-lg font-bold text-white shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-orange-hover">
            Start learning
          </button>
        </Link>
      ) : (
        <button
          onClick={() => setIsSignInModalOpen(true)}
          className="inline-flex items-center justify-center rounded-2xl bg-orange px-8 py-4 font-headline text-lg font-bold text-white shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-orange-hover"
        >
          Log in and start learning
        </button>
      )}
    </>
  );
}
