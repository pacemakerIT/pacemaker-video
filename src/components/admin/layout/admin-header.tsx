'use client';

import Link from 'next/link';
import Image from 'next/image';

export function AdminHeader() {
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* 왼쪽: 로고 */}
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/icons/paceup-logo.svg"
            alt="Admin Logo"
            width={120}
            height={28}
          />
        </Link>

        {/* 오른쪽: 관리자 + 돌아가기 */}
        <div className="flex items-center gap-6">
          {/* 관리자 */}
          <div className="flex items-center gap-2">
            <Image
              src="/icons/user.svg"
              alt="유저 아이콘"
              width={20}
              height={20}
            />
            <span className="text-pace-base text-pace-black-500 font-normal">
              관리자 님
            </span>
          </div>

          {/* 돌아가기 */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/icons/arrow-return.svg"
              alt="돌아가기 아이콘"
              width={20}
              height={20}
            />
            <span className="text-pace-base text-pace-black-500 font-normal">
              돌아가기
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
