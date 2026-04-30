import ListHeader from '@/components/common/list-header';
import LogoCarousel from '@/components/common/logo-marquee';
import ReviewContainer from '@/components/common/review-container';
import EbookListGrid from '@/components/features/ebook/ebook-list-grid';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function EBooksPage() {
  const mainDoc = await prisma.ebook.findFirst({
    where: { isMain: true, isPublic: true },
    select: { visualTitle1: true, id: true }
  });

  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        title={mainDoc?.visualTitle1 ?? ''}
        height={'h-[370px]'}
        gradientColors={{
          start: '#FFD262',
          middle: '#FFFFFF',
          end: '#FCF0D7'
        }}
        buttonText={'View the guide'}
        route={mainDoc ? `/ebooks/${mainDoc.id}` : undefined}
      />
      <LogoCarousel />
      <EbookListGrid />
      <ReviewContainer />
    </div>
  );
}
