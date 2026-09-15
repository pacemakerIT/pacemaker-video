'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUserContext } from '@/app/context/user-context';
import MyAccountLayout from './my-account-layout';

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

  return <MyAccountLayout>{children}</MyAccountLayout>;
}
