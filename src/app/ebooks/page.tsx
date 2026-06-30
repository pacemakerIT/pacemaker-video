import ListHeader from '@/components/common/list-header';
import LogoCarousel from '@/components/common/logo-marquee';
import ReviewContainer from '@/components/common/review-container';
import EbookListGrid from '@/components/features/ebook/ebook-list-grid';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function EBooksPage() {
  const mainDoc = await prisma.ebook.findFirst({
    where: { isMain: true, isPublic: true },
    select: {
      id: true,
      visualTitle1: true,
      visualTitle2: true,
      description: true
    }
  });

  const slides = [
    {
      tag: 'Featured Guide',
      tagColor: '#FF4F02',
      title: mainDoc?.visualTitle1 ?? 'Career Guide E-Books',
      highlight: mainDoc?.visualTitle2 ?? '',
      highlightColor: 'text-orange',
      description:
        mainDoc?.description ??
        'Step-by-step career guides written by industry mentors.',
      buttonText: 'View the guide',
      link: mainDoc ? `/ebooks/${mainDoc.id}` : undefined
    }
  ];

  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        slides={slides}
        gradientColors={{
          start: '#FFD262',
          middle: '#FFFFFF',
          end: '#FCF0D7'
        }}
      />
      <LogoCarousel />
      <div id="ebook-list">
        <EbookListGrid />
      </div>
      <ReviewContainer />
    </div>
  );
}
