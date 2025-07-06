'use client';

import {
  // SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut
} from '@clerk/nextjs';
import Link from 'next/link';
import SignInModalButton from '@/components/auth/sign-in-modal-button';
import UserDropdown from '@/components/user/user-drop-down';
import LanguageDropdown from '@/components/language-drop-down';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isDropdownOpen &&
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
          <nav className="flex flex-wrap items-center gap-[0px] text-pace-lg font-medium text-pace-black-500">
            <Link
              href="/courses"
              className="w-fit h-fit px-6 py-4 flex items-center justify-center hover:text-pace-orange-800"
            >
              온라인 강의
            </Link>
            <Link
              href="/ebooks"
              className="w-fit h-fit px-6 py-4 flex items-center justify-center hover:text-pace-orange-800"
            >
              전자책
            </Link>
            <Link
              href="/workshops"
              className="w-fit h-fit px-6 py-4 flex items-center justify-center hover:text-pace-orange-800"
            >
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

            {/* 사용자 이름 + 커스텀 드롭다운 */}
            <div className="flex items-center gap-2">
              <UserDropdown />
            </div>
          </SignedIn>

          {/* 언어 선택 UI (TO-DO : 기능 추가) */}
          <LanguageDropdown />
        </div>
      </div>
    </header>
  );
}
