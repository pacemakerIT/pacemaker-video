import EbookDetailContainer, {
  TOCItem
} from '@/components/features/ebook/ebook-detail-container';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { RelatedContentItem } from '@/types/video-detail';

interface EbookPageProps {
  params: Promise<{
    ebookId: string;
  }>;
}

export default async function EbookDetailPage({ params }: EbookPageProps) {
  const { ebookId } = await params;

  const ebook = await prisma.ebook.findUnique({
    where: { id: ebookId },
    select: {
      title: true,
      description: true,
      price: true,
      subTitle: true,
      targetAudienceTypes: true,
      tableOfContents: true,
      category: true,
      visualTitle1: true,
      visualTitle2: true,
      subDescription: true
    }
  });

  if (!ebook) {
    notFound();
  }

  const relatedDocs = await prisma.ebook.findMany({
    where: {
      isPublic: true,
      category: ebook.category,
      NOT: { id: ebookId }
    },
    select: {
      id: true,
      title: true,
      price: true,
      category: true,
      thumbnail: true
    },
    take: 3
  });

  const relatedItems: RelatedContentItem[] = relatedDocs.map((doc) => ({
    id: doc.id,
    itemId: doc.id,
    title: doc.title ?? '',
    price: doc.price ?? 0,
    category: doc.category ?? '',
    type: 'ebook',
    thumbnail: doc.thumbnail ?? null
  }));

  return (
    <div className="min-h-screen bg-white">
      <EbookDetailContainer
        title={ebook.title || undefined}
        description={ebook.description || undefined}
        price={ebook.price?.toString()}
        subtitle={ebook.subTitle || undefined}
        sectionTitle={ebook.visualTitle1 || undefined}
        visualTitle={ebook.visualTitle1 || undefined}
        visualTitle2={ebook.visualTitle2 || undefined}
        subDescription={ebook.subDescription || undefined}
        targetAudienceTypes={ebook.targetAudienceTypes}
        tableOfContents={(ebook.tableOfContents as unknown as TOCItem[]) || []}
        relatedItems={relatedItems}
      />
    </div>
  );
}
