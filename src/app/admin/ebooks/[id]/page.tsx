'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EbookForm, { EbookData } from '@/components/admin/ebooks/ebook-form';
import { getEbook } from '@/components/admin/ebooks/actions/ebook-actions';

export default function EbookEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [initialData, setInitialData] = useState<EbookData | undefined>(
    undefined
  );

  useEffect(() => {
    if (isNew) return;

    const fetchData = async () => {
      try {
        const ebook = await getEbook(id);
        if (ebook) {
          // Map Prisma Document to EbookData
          const data: EbookData = {
            id: ebook.id,
            category: ebook.category || '',
            isPublic: ebook.isPublic ? 'public' : 'private',
            showOnMain: ebook.isMain,
            title: ebook.title || '',
            intro: ebook.description || '',
            subTitle: ebook.subTitle || '',
            subDescription: ebook.subDescription || '',
            price: ebook.price?.toString() || '',
            thumbnailUrl: ebook.thumbnail || '',
            fileUrl: ebook.bucketUrl || '',
            visualTitle: ebook.visualTitle1 || '',
            visualTitle2: ebook.visualTitle2 || '',
            recommended: (ebook.targetAudienceTypes ||
              []) as EbookData['recommended'],
            sections:
              (ebook.tableOfContents as unknown as EbookData['sections']) || [
                { title: '', content: '' }
              ],
            links:
              (ebook.recommendedLinks as unknown as EbookData['links']) || []
          };
          setInitialData(data);
        }
      } catch {
        // fetch failed silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isNew]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">전자책 관리</h1>
      </div>
      <div>
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            {isNew ? '전자책 등록' : '전자책 수정'}
          </span>
        </div>

        <EbookForm initialData={initialData} />
      </div>
    </div>
  );
}
