'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import SignInModal from '@/components/auth/sign-in-modal';

const MainReviewContainer = () => {
  const { userId } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <div className="w-screen relative overflow-hidden bg-orange md:bg-orange max-md:bg-[radial-gradient(circle_at_80%_40%,#ff8c42_0%,#ff4f02_80%)]">
      <div className="h-[360px] max-w-[1248px] mx-auto">
        {/* 오른쪽 이미지 */}
        <Image
          src="/img/main-review.png"
          alt="background"
          className="hidden md:block absolute top-0 right-0 h-full max-w-[908px] w-2/3 object-center z-0"
          style={{ pointerEvents: 'none' }}
          width={908}
          height={360}
          priority
        />
        {/* 이미지 위에 올라가는 투명 배경 */}
        <div
          className="hidden md:block absolute top-0 right-0 h-full w-3/5 z-10"
          style={{
            background:
              'linear-gradient(to left, rgba(255,130,54,0.7) 0%, rgba(255,130,54,0) 80%)',
            pointerEvents: 'none'
          }}
        />
        {/* 왼쪽 텍스트/버튼 */}
        <div className="relative z-20 h-full flex items-center justify-start md:justify-center px-8 md:px-0 w-full md:w-2/5">
          <div className="flex flex-col gap-8 items-start">
            <h2 className="font-headline font-extrabold text-3xl text-white md:text-4xl leading-tight">
              Boost your career with
              <br />
              Pacemaker Today!
            </h2>

            {userId ? (
              <Link
                href="/courses"
                className="w-fit inline-flex items-start justify-start rounded-2xl border-2 border-white px-8 py-4 font-headline text-lg font-bold text-white transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-white hover:text-orange"
              >
                Browse online courses
              </Link>
            ) : (
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="w-fit inline-flex items-start justify-start rounded-2xl border-2 border-white px-8 py-4 font-headline text-lg font-bold text-white transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-white hover:text-orange"
              >
                Log in to start learning
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default MainReviewContainer;
