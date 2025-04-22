import { ClerkProvider } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';
import { PurchaseProvider } from './context/PurchaseContext';
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
      <PurchaseProvider>
        <html lang="en">
          <body>
            <Header />
            <main className="container">{children}</main>
            <Toaster />
          </body>
        </html>
      </PurchaseProvider>
    </ClerkProvider>
  );
}
