import '@/app/globals.css';
import { UserProvider } from '../context/user-context';
import AdminPage from '@/components/admin/admin-page';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <AdminPage>{children}</AdminPage>
    </UserProvider>
  );
}
