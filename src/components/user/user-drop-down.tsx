'use client';

import { useState, useEffect, useRef } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useUserContext } from '@/app/context/user-context';
import Link from 'next/link';
import Image from 'next/image';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserContext();
  const { signOut } = useClerk();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 유저 정보 없을 경우 기본 이름
  const displayName = user?.name || user?.email?.split('@')[0] || '회원';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 사용자 프로필 + 이름 전체 클릭 시 드롭다운 열림 */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <Image src="/icons/user.svg" alt="유저 아이콘" width={20} height={20} />
        <span className="text-pace-base text-pace-black-500 font-medium">
          {displayName}
        </span>
        <span className="text-pace-base text-pace-black-500 font-normal">
          님
        </span>
      </div>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-md z-50 items-center">
          <Link
            href="/mypage"
            className="block w-[122px] h-12 pt-4 pb-2 px-6 text-base font-normal text-pace-orange-800 hover:bg-gray-100 rounded-xl text-center"
            onClick={() => setIsOpen(false)}
          >
            마이페이지
          </Link>
          <Link
            href="/mypage/purchases"
            className="block w-[122px] h-12 px-6 pt-2 text-base font-normal text-pace-stone-500 hover:bg-gray-100 rounded-xl text-center"
            onClick={() => setIsOpen(false)}
          >
            구매내역
          </Link>
          <Link
            href="/mypage/setting"
            className="block w-[122px] h-12 px-6 pt-2 text-base font-normal text-pace-stone-500 hover:bg-gray-100 rounded-xl text-center"
            onClick={() => setIsOpen(false)}
          >
            설정
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="w-[122px] h-12 pt-2 pb-4 px-6 text-base font-normal text-pace-stone-500 hover:bg-gray-100 text-center rounded-xl"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
