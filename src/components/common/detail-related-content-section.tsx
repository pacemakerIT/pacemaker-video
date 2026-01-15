'use client';
import SectionHeader from './section-header';
import RelatedContentCard from './related-content-card';

import { RelatedContentItem } from '@/types/video-detail';

interface DetailRelatedContentSectionProps {
  title?: string;
  items?: RelatedContentItem[];
  gridCols?: '1' | '2' | '3';
}

export default function DetailRelatedContentSection({
  title = '이 컨텐츠와 함께 보면 좋아요!',
  items = [],
  gridCols = '3'
}: DetailRelatedContentSectionProps) {
  const getGridClass = () => {
    switch (gridCols) {
      case '1':
        return 'grid-cols-1';
      case '2':
        return 'grid-cols-1 md:grid-cols-2';
      case '3':
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <SectionHeader title={title} />
      <div className={`grid ${getGridClass()} gap-6`}>
        {items.map((item, index) => (
          <RelatedContentCard
            key={index}
            itemId={item.itemId}
            title={item.title}
            price={item.price}
            category={item.category}
          />
        ))}
      </div>
    </div>
  );
}
