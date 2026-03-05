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
}

export default function DetailRecommendationSection({
  title = 'Recommended For',
  items = []
}: DetailRecommendationSectionProps) {
  return (
    <div className="flex flex-col w-full gap-8">
      <SectionHeader title={title} />
      <div className="flex w-full gap-6">
        {items.map((item, index) => (
          <IconTextBox
            key={index}
            icon={item.icon}
            title={item.label}
            text={item.text}
          />
        ))}
      </div>
    </div>
  );
}
