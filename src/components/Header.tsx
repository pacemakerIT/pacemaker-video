import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
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

          {/* 회원가입 */}
          <Link
            href="/signup"
            className="flex items-center gap-2 text-pace-base font-normal text-pace-gray-700 hover:text-pace-orange-800"
          >
            회원가입
          </Link>

          {/* 로그인 */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 text-pace-base font-normal text-pace-orange-800 hover:text-pace-orange-600">
                <Image
                  src="/icons/login.svg"
                  alt="로그인 아이콘"
                  width={24}
                  height={24}
                  className="align-middle"
                />
                로그인
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
