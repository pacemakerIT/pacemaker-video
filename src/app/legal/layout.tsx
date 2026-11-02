import LegalNav from '@/components/legal/legal-nav';

export default function LegalLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="page-container py-16 md:py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <LegalNav />
        <div className="min-w-0 max-w-[760px]">{children}</div>
      </div>
    </div>
  );
}
