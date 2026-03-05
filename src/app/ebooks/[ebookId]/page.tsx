import EbookDetailContainer, {
  TOCItem
} from '@/components/features/ebook/ebook-detail-container';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EbookPageProps {
  params: Promise<{
    ebookId: string;
  }>;
}

export default async function EbookDetailPage({ params }: EbookPageProps) {
  const { ebookId } = await params;

  const ebook = await prisma.document.findUnique({
    where: {
      documentId: ebookId
    }
  });

  if (!ebook) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <EbookDetailContainer
        title={ebook.title || undefined}
        description={ebook.description || undefined}
        price={ebook.price?.toString()}
        targetAudienceTypes={ebook.targetAudienceTypes}
        tableOfContents={(ebook.tableOfContents as unknown as TOCItem[]) || []}
      />
    </div>
  );
}
