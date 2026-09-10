'use client';

import { UserProvider } from '../context/user-context';
import AdminPage from '@/components/admin/layout/admin-page';
import { AdminHeader } from '@/components/admin/layout/admin-header';
import { AdminFooter } from '@/components/admin/layout/admin-footer';
import { NavigationBlockerProvider } from '@/components/admin/common/navigation-blocker-context';

export default function AdminClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <NavigationBlockerProvider>
        <div className="flex h-screen flex-col">
          <AdminHeader />
          <div className="flex flex-1">
            <AdminPage>{children}</AdminPage>
          </div>
          <AdminFooter />
        </div>
      </NavigationBlockerProvider>
    </UserProvider>
  );
}
