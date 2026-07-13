'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, ArrowRight } from 'lucide-react';
import { resolveImageSrc, cn } from '@/lib/utils';
import { ItemType } from '@prisma/client';
const categoryBg: Record<string, string> = {
  INTERVIEW: 'bg-pace-blue-500',
  RESUME: 'bg-pace-purple-500',
  NETWORKING: 'bg-pace-yellow-500',
  MARKETING: 'bg-pace-orange-700',
  DESIGN: 'bg-pace-pink-500',
  PUBLIC: 'bg-pace-mint-600',
  IT: 'bg-pace-blue-700',
  ACCOUNTING: 'bg-pace-navy-500',
  SERVICE: 'bg-pace-teal-500',
  RECOMMENDED: 'bg-pace-orange-500'
};

interface RelatedContentCardProps {
  itemId: string;
  title: string;
  price: number;
  category: string;
  linkUrl?: string;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  className?: string;
}

export default function RelatedContentCard({
  itemId,
  title,
  price,
  category,
  linkUrl,
  thumbnailUrl,
  thumbnail,
  className
}: RelatedContentCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleCardClick = () => {
    if (linkUrl) {
      window.location.href = linkUrl;
    } else {
      window.location.href = `/courses/${itemId}`;
    }
  };

  const imageSrc = resolveImageSrc({
    thumbnail,
    thumbnailUrl,
    itemType: ItemType.COURSE // Default to COURSE for related items
  });

  return (
    <div className="w-full cursor-pointer font-normal">
      <div
        className={cn(
          'w-full bg-white rounded-none overflow-hidden border border-gray-100 shadow-[0_10px_30px_rgba(0,38,59,0.08)] relative flex flex-col',
          'transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.33,1,0.53,1)] hover:shadow-[0_28px_56px_rgba(0,38,59,0.13)] hover:-translate-y-1.5',
          className
        )}
        onClick={handleCardClick}
      >
        <div className="w-full h-[256px] relative overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              fill
              className="object-cover object-center"
              alt={title || 'courses img'}
              data-testid="card-image"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              No Image
            </div>
          )}
          {category && (
            <div className="absolute top-4 left-4 z-10">
              <span
                className={cn(
                  'text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider',
                  categoryBg[category.toUpperCase()] ?? 'bg-pace-blue-500'
                )}
              >
                {category}
              </span>
            </div>
          )}
          <button
            role="button"
            aria-label="like"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-100 z-10 group"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-300 ${
                isLiked
                  ? 'text-[#ff4f02] fill-[#ff4f02] group-hover:text-[#e04400] group-hover:fill-[#e04400]'
                  : 'text-gray-400 fill-transparent group-hover:text-[#ff4f02] group-hover:fill-[#ff4f02]'
              }`}
            />
          </button>
        </div>

        <div className="w-full p-6 flex flex-col justify-start items-start gap-4 flex-grow">
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-start gap-4">
              <h3 className="text-lg font-heading font-bold text-[#00263b] leading-tight line-clamp-3">
                {title}
              </h3>
              {price > 0 && (
                <span className="text-xl font-extrabold text-[#00263b] shrink-0">{`$${price}`}</span>
              )}
            </div>
          </div>

          <div className="w-full flex justify-start">
            <div className="text-[#00adbd] font-bold text-sm inline-flex items-center gap-1 hover:translate-x-1 transition-transform duration-300 ease-out">
              {`Learn more`}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
