'use client';

import Image from 'next/image';
import { ArrowRight, Heart } from 'lucide-react';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import { ItemType } from '@prisma/client';
import { itemCategoryLabel } from '@/constants/labels';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { resolveImageSrc } from '@/lib/utils';

const categoryMap = itemCategoryLabel.en;

const categoryBgColor: Record<string, string> = {
  INTERVIEW: 'rgb(54, 166, 247)',
  RESUME: 'rgb(255, 150, 49)',
  NETWORKING: 'rgb(159, 91, 231)',
  MARKETING: 'rgb(251, 119, 63)',
  DESIGN: 'rgb(249, 97, 100)',
  PUBLIC: 'rgb(50, 184, 117)',
  IT: 'rgb(21, 119, 230)',
  ACCOUNTING: 'rgb(55, 68, 108)',
  SERVICE: 'rgb(0, 161, 161)'
};

interface CardProps extends OnlineCards {
  itemType?: ItemType;
  thumbnail?: string;
  imageUrl?: string;
}

export default function Card({
  id,
  title,
  visualTitle2,
  price,
  description,
  category,
  itemType,
  thumbnail,
  thumbnailUrl,
  imageUrl
}: CardProps) {
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();
  const { isSignedIn } = useUser();
  const router = useRouter();

  const isLiked = favorites.some((f) => f.itemId === id);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/sign-in');
      return;
    }

    try {
      if (isLiked) {
        await removeFavorite(id);
      } else {
        await addFavorite(id, itemType || ItemType.COURSE);
      }
    } catch {
      // Failed to toggle like
    }
  };

  const imageSrc = resolveImageSrc({
    thumbnail,
    thumbnailUrl,
    imageUrl,
    itemType
  });

  const getLinkPath = () => {
    switch (itemType) {
      case ItemType.COURSE:
        return `/courses/${id}`;
      case ItemType.EBOOK:
        return `/ebooks/${id}`;
      case ItemType.WORKSHOP:
        return `/workshops/${id}`;
      default:
        return '/';
    }
  };

  const displayTitle = visualTitle2 || title || '';

  return (
    <div className="cursor-pointer w-full">
      <Link href={getLinkPath()}>
        <div className="w-full bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,38,59,0.08)] overflow-hidden rounded-none flex flex-col pm-card-lift dark:bg-gray-950">
          {/* Image + overlays */}
          <div className="relative h-[256px]">
            {imageSrc ? (
              <Image
                src={imageSrc}
                fill
                className="object-cover object-center"
                alt="courses img"
                data-testid="card-image"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                No Image
              </div>
            )}

            {category && (
              <div className="absolute top-4 left-4 z-10">
                <span
                  className="text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background:
                      categoryBgColor[category.toUpperCase()] ?? '#667085'
                  }}
                >
                  {categoryMap[category.toUpperCase()] || category}
                </span>
              </div>
            )}

            <button
              role="button"
              aria-label="like"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-100"
              onClick={handleToggleLike}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isLiked
                    ? 'text-pace-orange-800 fill-pace-orange-800'
                    : 'text-pace-gray-200 hover:text-pace-orange-800'
                }`}
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 flex-grow">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-bold text-[#00263B] leading-tight font-headline line-clamp-2 overflow-hidden">
                {displayTitle}
              </h3>
              <span className="text-xl font-extrabold text-[#00263B] shrink-0 font-body">{`$${
                typeof price === 'number'
                  ? price
                  : Number(String(price).replace(/[^0-9.]/g, ''))
              }`}</span>
            </div>

            <p className="text-sm leading-relaxed line-clamp-2 text-[#667085] font-body">
              {description}
            </p>

            <div className="inline-flex items-center gap-1 h-7 text-[#00ADBD] font-bold font-body text-sm hover:translate-x-1 transition-transform duration-300 ease-out mt-2">
              Learn more
              <ArrowRight width={18} height={18} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
