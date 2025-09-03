'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: '사이트 현황', href: '/admin/dashboard' },
  { label: '메인비주얼 관리', href: '/admin/main-visual' },
  { label: '온라인 강의 관리', href: '/admin/courses' },
  { label: '전자책 관리', href: '/admin/ebooks' },
  { label: '워크샵 관리', href: '/admin/workshops' },
  { label: '회원 관리', href: '/admin/users' },
  { label: '(기존) document', href: '/admin/document' },
  { label: '(기존) video', href: '/admin/video' }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-80 h-full shrink-0 border-r bg-white">
      <nav className="flex flex-col">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const activeClass = isActive ? 'font-bold !text-pace-orange-700' : '';

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-start pl-10 text-pace-stone-500 hover:bg-pace-ivory-500 hover:font-bold hover:text-pace-orange-700 py-6 font-medium ${activeClass}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
