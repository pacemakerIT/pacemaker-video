import '@/app/globals.css';
import Sidebar from '@/components/my-page-side-bar';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen grid grid-cols-[320px_1fr]">
      <Sidebar />
      <html lang="en">
        <body>
          <main className="container flex">{children}</main>
        </body>
      </html>
    </div>
  );
}
