import { ClerkProvider } from '@clerk/nextjs';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/app/context/user-context';
import { PurchaseProvider } from '@/app/context/purchase-context';
import './globals.css';

export default function RootLayout({
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
          <html lang="en">
            <body>
              <Header />
              <main className="container">{children}</main>
              <Toaster />
              <Footer />
            </body>
          </html>
        </PurchaseProvider>
      </UserProvider>
    </ClerkProvider>
  );
}
