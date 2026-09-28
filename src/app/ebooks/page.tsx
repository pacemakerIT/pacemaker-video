import LogoCarousel from '@/components/common/logo-marquee';
import ReviewContainer from '@/components/common/review-container';
import EbookHero from '@/components/features/ebook/ebook-hero';
import EbookListGrid from '@/components/features/ebook/ebook-list-grid';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function EBooksPage() {
  const mainDoc = await prisma.ebook.findFirst({
    where: { isMain: true, isPublic: true },
    select: {
      visualTitle1: true,
      visualTitle2: true
    }
  });

  return (
    <div className="w-screen flex flex-col">
      <EbookHero
        title={mainDoc?.visualTitle1 ?? 'The 94% Success Formula:'}
        titleLine2={
          mainDoc?.visualTitle2 ?? 'Writing Applications That Set You Apart'
        }
      />
      <LogoCarousel />
      <div id="ebook-list">
        <EbookListGrid />
      </div>
    </div>
  );
}
