'use client';
import { LucideIcon } from 'lucide-react';
import SectionHeader from './section-header';
import IconTextBox from './icon-text-box';

interface RecommendationItem {
  icon: LucideIcon;
  label: string;
  text: string;
}

interface DetailRecommendationSectionProps {
  title?: string;
  items?: RecommendationItem[];
  headerClassName?: string;
  itemClassName?: string;
}

export default function DetailRecommendationSection({
  title = 'Recommended For',
  items = [],
  headerClassName,
  itemClassName
}: DetailRecommendationSectionProps) {
  return (
    <div className="flex flex-col w-full gap-8">
      <SectionHeader title={title} className={headerClassName} />
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((item, index) => (
          <IconTextBox
            key={index}
            icon={item.icon}
            title={item.label}
            text={item.text}
            className={itemClassName}
          />
        ))}
      </div>
    </div>
  );
}
