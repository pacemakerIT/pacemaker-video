'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ItemType } from '@prisma/client';
import { MyCard } from '@/types/my-card';
import { resolveImageSrc } from '@/lib/utils';

const ebookThemes: Record<string, { background: string; foreground: string }> =
  {
    Marketing: { background: '#FFF5F2', foreground: '#FF6B3D' },
    Finance: { background: '#EEF4FF', foreground: '#2563EB' },
    Design: { background: '#ECFDF3', foreground: '#039855' }
  };

const badgeColors: Record<string, string> = {
  Interview: '#36A6F6',
  Resume: '#FF9631',
  Career: '#00ADBD',
  Networking: '#FF4F02',
  Marketing: '#FF7E54',
  Finance: '#3B82F6',
  Design: '#12B76A'
};

export default function MyPageCard({
  itemId,
  title,
  description,
  category,
  type,
  totalChapters = 0,
  completedChapters = 0,
  image
}: MyCard) {
  const progress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;
  const isEbook = type === ItemType.EBOOK;
  const theme = ebookThemes[category] ?? {
    background: '#F2F4F7',
    foreground: '#475467'
  };
  const imageSrc = resolveImageSrc({ thumbnail: image });
  const href = isEbook ? `/ebooks/${itemId}` : `/courses/${itemId}`;
  const unit = isEbook ? 'pages' : 'lessons';
  const action =
    progress === 100
      ? 'Completed'
      : progress === 0
        ? isEbook
          ? 'Start reading'
          : 'Start course'
        : isEbook
          ? 'Continue reading'
          : 'Continue learning';

  return (
    <Link
      href={href}
      className="group/card flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {isEbook && !imageSrc ? (
        <div
          className="relative flex h-[200px] flex-col justify-start p-6"
          style={{ backgroundColor: theme.background }}
        >
          <span
            className="mb-3 w-fit rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{
              backgroundColor: badgeColors[category] ?? theme.foreground
            }}
          >
            {category}
          </span>
          <h3
            className="font-headline text-2xl font-extrabold leading-tight"
            style={{ color: theme.foreground }}
          >
            {category}
          </h3>
          <p
            className="mt-1 line-clamp-3 text-xs font-medium leading-relaxed"
            style={{ color: theme.foreground }}
          >
            {description}
          </p>
        </div>
      ) : (
        <div className="relative h-[200px] w-full overflow-hidden bg-[#00263B]/5">
          <Image
            src={imageSrc ?? '/img/online-course-1.png'}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
          <span
            className="absolute left-4 top-4 z-10 rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: badgeColors[category] ?? '#FF4F02' }}
          >
            {category}
          </span>
        </div>
      )}

      <div className="flex flex-grow flex-col justify-between space-y-4 p-6">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#475467]">
            <span>
              {completedChapters} / {totalChapters} {unit}
            </span>
            <span className="font-headline font-bold text-[#00263B]">
              {progress}% complete
            </span>
          </div>
          <div className="flex h-[52px] items-start">
            <h3 className="line-clamp-2 font-headline text-lg font-bold leading-tight text-[#00263B]">
              {title}
            </h3>
          </div>
        </div>
        <div className="pt-2">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#F2F4F7]">
            <div
              className="h-full rounded-full bg-[#FF4F02] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span
            className={`inline-flex items-center gap-1 font-headline text-sm font-bold transition-transform duration-300 group-hover/card:translate-x-1 ${progress === 0 ? 'text-[#FF4F02]' : progress === 100 ? 'text-[#00263B]' : 'text-[#00ADBD]'}`}
          >
            {action}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
