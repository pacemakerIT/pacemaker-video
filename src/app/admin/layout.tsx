'use client';

import '@/app/globals.css';
import { UserProvider } from '../context/user-context';
import AdminPage from '@/components/admin/layout/admin-page';
import { AdminHeader } from '@/components/admin/layout/admin-header';
import { AdminFooter } from '@/components/admin/layout/admin-footer';
import { NavigationBlockerProvider } from '@/components/admin/common/navigation-blocker-context';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <NavigationBlockerProvider>
        <div className="flex h-screen flex-col">
          {/* 어드민 전용 헤더 */}
          <AdminHeader />

          {/* 본문 (사이드바 + 컨텐츠) */}
          <div className="flex flex-1">
            <AdminPage>{children}</AdminPage>
          </div>

          <AdminFooter />
        </div>
      </NavigationBlockerProvider>
    </UserProvider>
  );
}
