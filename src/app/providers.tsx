'use client';

import { usePathname } from 'next/navigation';
import { ClerkProvider } from '@clerk/nextjs';
import { UserProvider } from '@/app/context/user-context';
import { PurchaseProvider } from '@/app/context/purchase-context';
import { FavoriteProvider } from '@/app/context/favorite-context';
import { CartProvider } from '@/app/context/cart-context';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <UserProvider>
        <PurchaseProvider>
          <CartProvider>
            <FavoriteProvider>
              {!isAdmin && <Header />}
              <main>{children}</main>
              <Toaster />
              {!isAdmin && <Footer />}
            </FavoriteProvider>
          </CartProvider>
        </PurchaseProvider>
      </UserProvider>
    </ClerkProvider>
  );
}
