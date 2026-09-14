'use client';
import Image from 'next/image';
import { Heart, ArrowRight } from 'lucide-react';
import { resolveImageSrc, cn } from '@/lib/utils';
import { ItemType } from '@prisma/client';
import { getCategoryColors } from '@/lib/category-colors';

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
import { useFavoriteContext } from '@/app/context/favorite-context';
import { useUserContext } from '@/app/context/user-context';
import { toast } from 'sonner';

interface RelatedContentCardProps {
  itemId: string;
  title: string;
  price: number;
  category: string;
  linkUrl?: string;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  tagline?: string;
  itemType?: ItemType;
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
  tagline,
  itemType = ItemType.COURSE,
  className
}: RelatedContentCardProps) {
  const isEbook = itemType === ItemType.EBOOK;
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();
  const { user } = useUserContext();
  const isLiked = favorites.some(
    (f) => f.itemId === itemId && f.itemType === itemType
  );

  const handleCardClick = () => {
    if (linkUrl) {
      window.location.href = linkUrl;
    } else {
      window.location.href = isEbook
        ? `/ebooks/${itemId}`
        : `/courses/${itemId}`;
    }
  };

  const imageSrc = resolveImageSrc({
    thumbnail,
    thumbnailUrl,
    itemType
  });

  const toggleLike = () => {
    if (!user?.id) {
      toast.error('Please log in to use favorite.');
      return;
    }

    if (isLiked) {
      removeFavorite(itemId, itemType);
    } else {
      addFavorite(itemId, itemType);
    }
  };

  if (isEbook) {
    const colors = getCategoryColors(category);
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
          <div
            className={cn(
              'relative min-h-[256px] flex flex-col justify-center px-8 pt-16 md:pt-8 pb-8',
              colors.bg
            )}
          >
            {category && (
              <div className="absolute top-4 left-4 z-10">
                <span
                  className={cn(
                    'text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider',
                    colors.badge
                  )}
                >
                  {category}
                </span>
              </div>
            )}
            <h4
              className={cn(
                'text-3xl font-extrabold mb-3 font-headline capitalize',
                colors.text
              )}
            >
              {category?.toLowerCase()}
            </h4>
            {tagline && (
              <p
                className={cn(
                  'text-base font-medium leading-tight mb-4',
                  colors.text
                )}
              >
                {tagline}
              </p>
            )}
            <button
              type="button"
              role="button"
              aria-label={isLiked ? 'Saved' : 'Save'}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleLike();
              }}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isLiked
                    ? 'text-pace-orange-800 fill-pace-orange-800'
                    : 'text-pace-gray-200 group-hover:text-pace-orange-800'
                }`}
              />
            </button>
          </div>

          <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-bold font-headline text-[#00263b] leading-tight">
                {title}
              </h3>
              {price > 0 && (
                <span className="text-xl font-extrabold text-[#00263b] shrink-0">{`$${price}`}</span>
              )}
            </div>
            <div className="inline-flex items-center gap-1 text-orange font-bold text-sm hover:translate-x-1 transition-transform duration-300 ease-out mt-2 w-fit">
              View details
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <button
          role="button"
          aria-label="like"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-100 z-10 group"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleLike();
          }}
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 ${
              isLiked
                ? 'text-pace-orange-800 fill-pace-orange-800'
                : 'text-pace-gray-200 group-hover:text-pace-orange-800'
            }`}
          />
        </button>

        <div className="w-full aspect-[3/2] relative overflow-hidden">
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
