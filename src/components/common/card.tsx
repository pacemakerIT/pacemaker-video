'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import { ItemType } from '@prisma/client';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { useUserContext } from '@/app/context/user-context';
import { useRouter } from 'next/navigation';
import { resolveImageSrc } from '@/lib/utils';
import { getCategoryColors } from '@/lib/category-colors';

interface CardProps extends OnlineCards {
  itemType?: ItemType;
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
  const { user } = useUserContext();
  const router = useRouter();
  const resolvedItemType = itemType || ItemType.COURSE;

  const isLiked = favorites.some(
    (f) => f.itemId === id && f.itemType === resolvedItemType
  );

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/sign-in');
      return;
    }

    try {
      if (isLiked) {
        await removeFavorite(id, resolvedItemType);
      } else {
        await addFavorite(id, resolvedItemType);
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

  const colors = getCategoryColors(category);

  return (
    <div className="cursor-pointer group">
      <Link href={getLinkPath()} className="block w-full">
        <div className="pm-card-lift flex w-full flex-col overflow-hidden rounded-none border border-gray-100 bg-white shadow-card">
          <div
            className={`relative h-[256px] w-full ${colors.bg} flex flex-col items-start overflow-hidden`}
          >
            {imageSrc ? (
              <Image
                src={imageSrc}
                fill
                className="object-cover"
                alt="course img"
                data-testid="card-image"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-300 text-sm font-semibold tracking-widest uppercase select-none">
                  NO IMAGE
                </span>
              </div>
            )}

            <button
              type="button"
              role="button"
              aria-label={isLiked ? 'Saved' : 'Save'}
              className={`favorite-heart absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500 ease-out hover:scale-110 ${
                isLiked ? 'favorite-heart--liked' : ''
              }`}
              onClick={handleToggleLike}
            >
              <span className="material-symbols-outlined text-xl leading-none">
                favorite
              </span>
            </button>

            {category && (
              <div
                className={`absolute left-4 top-4 z-50 ${colors.badge} rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white`}
              >
                {category}
              </div>
            )}
          </div>

          <div className="flex flex-grow flex-col space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-headline text-lg font-bold leading-tight text-navy">
                {displayTitle}
              </h3>
              <span className="whitespace-nowrap text-xl font-extrabold text-navy">
                {`$${
                  typeof price === 'number'
                    ? price.toLocaleString()
                    : Number(
                        String(price).replace(/[^0-9.]/g, '')
                      ).toLocaleString()
                }`}
              </span>
            </div>

            <p className="line-clamp-2 font-body text-sm leading-relaxed text-[#667085]">
              {description}
            </p>

            <div className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal transition-transform duration-300 ease-out hover:translate-x-1">
              Learn more <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
