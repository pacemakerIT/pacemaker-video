import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Header />
          <main className="container">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
