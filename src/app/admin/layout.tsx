import { redirect } from 'next/navigation';
import { requireAdminUser } from '@/lib/admin-auth';
import AdminClientLayout from './admin-client-layout';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const adminAccess = await requireAdminUser();

  if (!adminAccess.ok) {
    redirect(adminAccess.status === 401 ? '/sign-in?redirect_url=/admin' : '/');
  }

  return <AdminClientLayout>{children}</AdminClientLayout>;
}
