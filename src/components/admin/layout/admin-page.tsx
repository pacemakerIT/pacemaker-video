'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUserContext } from '@/app/context/user-context';
import AdminSidebar from '@/components/admin/layout/admin-sidebar';

export default function AdminPage({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      toast('Please sign in');
      router.push('/');
    } else if (user && user.roleId !== 'ADMIN') {
      toast('Access denied');
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>Error: {error}</p>;
  if (!user || user.roleId !== 'ADMIN') return null;

  return (
    <div className="flex w-full h-full">
      <div className="w-60 h-full shrink">
        <AdminSidebar />
      </div>
      <main className="flex-1 h-full overflow-auto shrink-0 min-w-0">
        {children}
      </main>
    </div>
  );
}
