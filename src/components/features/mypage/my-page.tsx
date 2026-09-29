'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUserContext } from '@/app/context/user-context';
import MyPageSidebar from './my-page-side-bar';

export default function MyPage({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && !isLoading) {
      toast('Please sign in');
      return router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return null;

  if (pathname === '/mypage') return children;

  if (pathname === '/mypage/cart') {
    return (
      <div className="min-h-screen bg-surface pb-28 font-body text-body-text">
        <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-8 px-6 py-12 lg:flex-row">
          <MyPageSidebar cartDesign />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen grid grid-cols-[320px_1fr]">
      <MyPageSidebar />
      <main>{children}</main>
    </div>
  );
}
