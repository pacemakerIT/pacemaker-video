'use client';

import { usePathname } from 'next/navigation';
import { ClerkProvider } from '@clerk/nextjs';
import { UserProvider, useUserContext } from '@/app/context/user-context';
import { PurchaseProvider } from '@/app/context/purchase-context';
import { FavoriteProvider } from '@/app/context/favorite-context';
import { CartProvider } from '@/app/context/cart-context';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { Toaster } from '@/components/ui/sonner';
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
          <CartWrapper>
            <FavoriteWrapper>{children}</FavoriteWrapper>
          </CartWrapper>
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

          <main className={!isAdmin ? '' : ''}>{children}</main>
          <Toaster />

          {!isAdmin && <Footer />}
        </body>
      </html>
    </FavoriteProvider>
  );
}

function CartWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useUserContext();

  return (
    <CartProvider userId={user?.id ?? ''}>
      <html lang="en" style={{ colorScheme: 'light' }}>
        <body>
          <main className="w-full">{children}</main>
        </body>
      </html>
    </CartProvider>
  );
}
