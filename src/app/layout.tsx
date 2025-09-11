'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider, useUserContext } from '@/app/context/user-context';
import { PurchaseProvider } from '@/app/context/purchase-context';
import { FavoriteProvider } from '@/app/context/favorite-context';
import { CartProvider } from './context/cart-context';

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

  return (
    <FavoriteProvider userId={user?.id ?? ''}>
      <html lang="en" style={{ colorScheme: 'light' }}>
        <body>
          <Header />
          <main className="container">{children}</main>
          <Toaster />
          <Footer />
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
          <main className="container">{children}</main>
        </body>
      </html>
    </CartProvider>
  );
}
