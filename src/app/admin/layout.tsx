import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import '@/app/globals.css';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <html lang="en">
        <body>
          <SidebarTrigger />
          <main className="container">{children}</main>
          <Toaster />
        </body>
      </html>
    </SidebarProvider>
  );
}
