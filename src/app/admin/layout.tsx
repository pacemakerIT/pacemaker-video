'use client';

import '@/app/globals.css';
import { UserProvider } from '../context/user-context';
import AdminPage from '@/components/admin/layout/admin-page';
import { AdminHeader } from '@/components/admin/layout/admin-header';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div className="flex h-screen flex-col">
        {/* 어드민 전용 헤더 */}
        <AdminHeader />

        {/* 본문 (사이드바 + 컨텐츠) */}
        <div className="flex flex-1">
          <AdminPage>{children}</AdminPage>
        </div>
      </div>
    </UserProvider>
  );
}
