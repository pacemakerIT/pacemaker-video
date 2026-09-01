'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { getUserDisplayName, useUserContext } from '@/app/context/user-context';
import {
  CircleHelp,
  Heart,
  History,
  Settings,
  ShoppingCart,
  UserRound
} from 'lucide-react';

const menuItems = [
  { label: 'My Account', href: '/mypage', icon: UserRound },
  { label: 'Cart', href: '/mypage/cart', icon: ShoppingCart },
  { label: 'Wish list', href: '/mypage/favorites', icon: Heart },
  { label: 'Order History', href: '/mypage/purchases', icon: History },
  { label: 'Contact Us', href: '/mypage/inquiries', icon: CircleHelp }
];

export default function MyPageSidebar() {
  const { user } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-full shrink-0 lg:w-[320px]">
      <div className="relative flex flex-col items-center border border-gray-100 bg-white p-6 shadow-card lg:sticky lg:top-28">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-2xl p-2.5 text-[#475467] transition-colors hover:bg-[#FF4F02]/10 hover:text-[#FF4F02]"
          aria-label="Settings"
          onClick={() => router.push('/mypage/setting')}
        >
          <Settings className="h-5 w-5" />
        </button>

        <div className="relative mb-4 h-28 w-28 rounded-full border-4 border-[#FF4F02]/10 p-1 shadow-sm">
          <Image
            src={user?.image || '/img/resume_lecture.jpeg'}
            alt={`${getUserDisplayName(user)} profile`}
            fill
            className="rounded-full object-cover p-1"
            sizes="112px"
          />
        </div>

        <h2 className="mb-6 font-headline text-xl font-bold text-[#00263B]">
          {getUserDisplayName(user)}
        </h2>

        <nav className="flex w-full flex-col gap-1 border-t border-gray-100 pt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 font-headline transition-colors ${
                  isActive
                    ? 'border-l-4 border-[#FF4F02] bg-[#FF4F02]/10 font-bold text-[#FF4F02]'
                    : 'font-medium text-[#475467] hover:bg-[#F2F4F7] hover:text-[#00263B]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
