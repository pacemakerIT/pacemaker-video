'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUserContext } from '@/app/context/user-context';
import MyPageSidebar from './my-page-side-bar';

export default function MyPage({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      toast('Please sign in');
      return router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return null;

  return (
    <div className="w-screen grid grid-cols-[320px_1fr]">
      <MyPageSidebar />
      <main className="container flex">{children}</main>
    </div>
  );
}
