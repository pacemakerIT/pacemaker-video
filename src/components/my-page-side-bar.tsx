'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import profileImg from '../../public/img/resume_lecture.jpeg';

const menuItems = [
  { label: '마이페이지', href: '/mypage' },
  { label: '장바구니', href: '/mypage/cart' },
  { label: '찜목록', href: '/mypage/favorites' },
  { label: '구매 내역', href: '/mypage/purchases' },
  { label: '1:1문의', href: '/mypage/inquiries' }
];

export default function MyPageSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-80 h-full shrink-0 border-r bg-white py-8">
      <div className="relative flex flex-col items-center mb-8">
        <Image
          src={profileImg}
          alt="프로필"
          className="w-40 h-40 rounded-full mb-4"
          width={160}
          height={160}
        />
        <button
          type="button"
          className="absolute -top-5 right-3"
          aria-label="환경설정"
        >
          <Image
            src="/icons/btn_setting.svg"
            alt="환경설정"
            width={40}
            height={40}
            className="hover:opacity-75"
          />
        </button>

        <h2 className="text-pace-xl text-pace-gray-500 font-bold">Jamie</h2>
      </div>

      <nav className="flex flex-col">
        {menuItems.map((item, index) => {
          const isLast = index === menuItems.length - 1;
          const isActive = pathname === item.href;
          const borderClass = `${isLast ? 'border-b' : ''}`;
          const activeClass = isActive ? 'font-bold !text-pace-orange-700' : '';

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-center text-pace-stone-500 hover:bg-pace-ivory-500 hover:font-bold hover:text-pace-orange-700 py-6 border-t ${borderClass} ${activeClass}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
