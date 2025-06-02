import '@/app/globals.css';
import MyPageSidebar from '@/components/my-page-side-bar';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen grid grid-cols-[320px_1fr]">
      <MyPageSidebar />
      <main className="container flex">{children}</main>
    </div>
  );
}
