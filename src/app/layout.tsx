'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider, useUserContext } from '@/app/context/user-context';
import { PurchaseProvider } from '@/app/context/purchase-context';
import { FavoriteProvider } from '@/app/context/favorite-context';
import { usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <UserProvider>
        <PurchaseProvider>
          <FavoriteWrapper>{children}</FavoriteWrapper>
        </PurchaseProvider>
      </UserProvider>
    </ClerkProvider>
  );
}

function FavoriteWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useUserContext();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <FavoriteProvider userId={user?.id ?? ''}>
      <html lang="en" style={{ colorScheme: 'light' }}>
        <body>
          {/* admin 경로가 아닐 때만 공용 Header 표시 */}
          {!isAdmin && <Header />}

          <main className={!isAdmin ? 'container' : ''}>{children}</main>
          <Toaster />

          {/* Footer는 항상 공통 */}
          <Footer />
        </body>
      </html>
    </FavoriteProvider>
  );
}
