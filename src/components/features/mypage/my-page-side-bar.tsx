'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { getUserDisplayName, useUserContext } from '@/app/context/user-context';

const menuItems = [
  { label: '마이페이지', href: '/mypage' },
  { label: '장바구니', href: '/mypage/cart' },
  { label: '찜목록', href: '/mypage/favorites' },
  { label: '구매 내역', href: '/mypage/purchases' },
  { label: '1:1문의', href: '/mypage/inquiries' }
];

export default function MyPageSidebar({
  cartDesign = false
}: {
  cartDesign?: boolean;
}) {
  const { user } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();

  if (cartDesign) {
    const labels = [
      'My Account',
      'Cart',
      'Wish list',
      'Order History',
      'Contact Us'
    ];
    const icons = [
      'person',
      'shopping_cart',
      'favorite',
      'receipt_long',
      'support_agent'
    ];
    return (
      <aside className="w-full shrink-0 lg:w-[320px]">
        <div className="relative flex flex-col items-center border border-gray-100 bg-white p-6 shadow-[0_10px_30px_rgba(0,38,59,0.08)] lg:sticky lg:top-28">
          <Link
            href="/mypage/setting"
            aria-label="Settings"
            className="absolute right-4 top-4 rounded-2xl p-2.5 text-body-text transition-colors hover:bg-orange/10 hover:text-orange"
          >
            <span
              className="material-symbols-outlined text-xl"
              aria-hidden="true"
            >
              settings
            </span>
          </Link>
          <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-orange/10 p-1 shadow-sm">
            {user?.image ? (
              <Image
                src={user.image}
                alt={getUserDisplayName(user)}
                width={104}
                height={104}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="font-headline text-4xl font-bold text-navy">
                {getUserDisplayName(user).slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="mb-6 font-headline text-xl font-bold text-navy">
            {getUserDisplayName(user)}
          </h2>
          <nav aria-label="My account" className="flex w-full flex-col gap-1">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${pathname === item.href ? 'border-l-4 border-orange bg-orange/10 font-headline font-bold text-orange' : 'font-medium text-body-text hover:bg-gray-soft hover:text-navy'}`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  aria-hidden="true"
                >
                  {icons[index]}
                </span>
                {labels[index]}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-80 h-full shrink-0 border-r bg-white py-8">
      <div className="relative flex flex-col items-center mb-8">
        <Image
          src="/img/resume_lecture.jpeg"
          alt="프로필"
          className="w-40 h-40 rounded-full mb-4"
          width={160}
          height={160}
        />
        <button
          type="button"
          className="absolute -top-5 right-3"
          aria-label="환경설정"
          onClick={() => router.push('/mypage/setting')}
        >
          <Image
            src="/icons/btn_setting.svg"
            alt="환경설정"
            width={40}
            height={40}
            className="hover:opacity-75"
          />
        </button>

        <h2 className="text-pace-xl text-pace-gray-500 font-bold">
          {getUserDisplayName(user)}
        </h2>
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
