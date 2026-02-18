'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EbookForm, { EbookData } from '@/components/admin/ebooks/ebook-form';
import { getEbook } from '@/lib/actions/ebook-actions';
import { TargetAudienceType } from '@prisma/client';

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
            processTitle: ebook.processTitle || '',
            processContent: ebook.processContent || '',
            price: ebook.price?.toString() || '',
            thumbnail: null,
            thumbnailUrl: ebook.thumbnail || '',
            file: null,
            fileUrl: ebook.bucketUrl || '',
            visualTitle: ebook.visualTitle1 || '',
            visualTitle2: ebook.visualTitle2 || '',
            recommended: (ebook.targetAudienceTypes || []).map((t) => {
              // Reverse map Enum to string if needed
              switch (t) {
                case TargetAudienceType.IT:
                  return 'IT 개발';
                case TargetAudienceType.GOVERNMENT:
                  return '공무원';
                case TargetAudienceType.FINANCE:
                  return '재무회계';
                case TargetAudienceType.DESIGN:
                  return '디자인';
                case TargetAudienceType.RESUME:
                  return '북미 취업이력서';
                case TargetAudienceType.INTERVIEW:
                  return '인터뷰 준비';
                case TargetAudienceType.NETWORKING:
                  return '네트워킹';
                case TargetAudienceType.SERVICE:
                  return '서비스';
                default:
                  return t;
              }
            }) as string[],
            sections:
              (ebook.tableOfContents as unknown as EbookData['sections']) || [
                { title: '', content: '' }
              ],
            links:
              (ebook.recommendedLinks as unknown as EbookData['links']) || [
                { url: '', name: '' }
              ]
          };
          setInitialData(data);
        }
      } catch (error) {
        console.error('Failed to fetch ebook:', error);
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
