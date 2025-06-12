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

export function Header() {
  const { user, isLoading, error } = useUserContext();

  return (
    <header className="w-full border-b">
      <div className="flex h-16 items-center justify-between px-8">
        {/* 왼쪽: Pacemaker 로고 */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-pace-2xl text-pace-orange-800">
              pacemaker
            </span>
          </Link>
        </div>

        {/* 오른쪽: 메뉴 + 회원가입 + 로그인 */}
        <div className="flex items-center gap-8">
          {/* 메뉴 */}
          <nav className="flex items-center gap-6 text-pace-base font-medium text-pace-black-500">
            <Link
              href="/courses"
              className="text-pace-lg font-medium text-pace-black-500 hover:text-pace-orange-800"
            >
              온라인 강의
            </Link>
            <Link
              href="/ebooks"
              className="text-pace-lg font-medium text-pace-black-500 hover:text-pace-orange-800"
            >
              전자책
            </Link>
            <Link
              href="/workshops"
              className="text-pace-lg font-medium text-pace-black-500 hover:text-pace-orange-800"
            >
              오프라인 워크샵
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
              href="/cart"
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
        </div>
      </div>
    </header>
  );
}
