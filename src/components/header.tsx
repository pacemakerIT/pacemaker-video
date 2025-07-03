'use client';

import {
  // SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Link from 'next/link';
import { useUserContext } from '@/app/context/user-context';
import SignInModalButton from '@/components/auth/sign-in-modal-button';
import Image from 'next/image';
import { useState } from 'react';

export function Header() {
  const { user, isLoading, error } = useUserContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'KOR' | 'ENG'>(
    'KOR'
  ); // Selected Language Status

  return (
    <header className="w-full border-b">
      <div className="flex flex-wrap items-center justify-between px-4 md:px-10 h-auto md:h-20 gap-y-2">
        {/* 로고 */}
        <Link href="/" className="flex items-center pt-5 pb-5">
          <Image
            src="/icons/paceup-logo.svg"
            alt="Paceup Logo"
            width={140}
            height={30}
            priority
          />
        </Link>

        {/* 오른쪽: 메뉴 및 로그인 등 */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* 메뉴 */}
          <nav className="flex flex-wrap items-center gap-3 md:gap-6 text-sm md:text-base font-medium text-pace-black-500">
            <Link href="/courses" className="hover:text-pace-orange-800">
              온라인 강의
            </Link>
            <Link href="/ebooks" className="hover:text-pace-orange-800">
              전자책
            </Link>
            <Link href="/workshops" className="hover:text-pace-orange-800">
              워크샵
            </Link>
          </nav>

          <SignedOut>
            {/* 회원가입: 모달 */}
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 text-pace-base font-normal text-pace-gray-700 hover:text-pace-orange-800">
                회원가입
              </button>
            </SignUpButton>

            {/* 로그인 */}
            <SignInModalButton />
          </SignedOut>
          <SignedIn>
            <Link
              href="/mypage/cart"
              className="flex items-center gap-2 text-pace-base font-normal text-pace-gray-700 hover:text-pace-orange-800"
            >
              <div className="relative">
                {/* TODO: 장바구니 DB 연결 */}
                <div className="w-5 h-5 bg-pace-orange-600 text-white text-[10px] rounded-full flex items-center justify-center leading-none">
                  0
                </div>
              </div>
              장바구니
            </Link>

            {/* 사용자 이름 + 프로필 버튼 */}
            <div className="flex items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      'w-6 h-6 rounded-full bg-white shadow-sm',
                    userButtonTrigger: 'flex items-center'
                  }
                }}
              />
              {!isLoading && user && (
                <>
                  <span className="text-pace-base text-pace-black-500 font-medium">
                    {user.name && user.name !== 'N/A'
                      ? user.name
                      : user.email.split('@')[0]}
                  </span>
                </>
              )}
              {error && (
                <span className="text-pace-base text-pace-black-500 font-medium">
                  회원
                </span>
              )}
              <span className="text-pace-base text-pace-black-500 font-normal">
                님
              </span>
            </div>
          </SignedIn>

          {/* 언어 선택 UI (TO-DO : 기능 추가) */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm md:text-base text-pace-black-500 hover:text-pace-orange-800"
            >
              <Image
                src="/icons/globe-01.svg"
                alt="언어 선택 아이콘"
                width={20}
                height={20}
              />
              <span className="font-sans text-pace-sm font-normal text-pace-stone-500">
                {selectedLanguage}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-20 rounded-xl border border-gray-200 bg-white shadow-md z-50 text-sm py-1">
                <div
                  className={`flex justify-center items-center px-4 py-2 h-12 text-base font-medium cursor-pointer ${
                    selectedLanguage === 'KOR'
                      ? 'text-pace-orange-800'
                      : 'text-pace-stone-500 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedLanguage('KOR');
                    setIsDropdownOpen(false);
                  }}
                >
                  KOR
                </div>
                <div
                  className={`flex justify-center items-center px-4 py-2 h-12 text-base font-medium cursor-pointer ${
                    selectedLanguage === 'ENG'
                      ? 'text-pace-orange-800'
                      : 'text-pace-stone-500 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedLanguage('ENG');
                    setIsDropdownOpen(false);
                  }}
                >
                  ENG
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
