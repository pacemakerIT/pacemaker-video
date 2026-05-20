'use client';

import Image from 'next/image';
import { ArrowRight, Heart } from 'lucide-react';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import { ItemType } from '@prisma/client';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { resolveImageSrc } from '@/lib/utils';

interface CardProps extends OnlineCards {
  itemType?: ItemType; // WORKSHOP, DOCUMENT, VIDEO
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
        // Fallback to COURSE if type is undefined, though it should be passed
        await addFavorite(id, itemType || ItemType.COURSE);
      }
    } catch {
      // Failed to toggle like
    }
  };

  // Use the central utility for image source resolution
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
        return '/'; // fallback
    }
  };

  const displayTitle = visualTitle2 || title || '';

  // Category-based color mapping
  const colorMap: Record<string, { bg: string; badge: string; text: string }> =
    {
      MARKETING: {
        bg: 'bg-[#FFF5F1]',
        badge: 'bg-[#FF8266]',
        text: 'text-[#FF4F02]'
      },
      DESIGN: {
        bg: 'bg-[#FFF0F0]',
        badge: 'bg-[#FF7676]',
        text: 'text-[#FF4D4D]'
      },
      GOV: {
        bg: 'bg-[#F0FFF4]',
        badge: 'bg-[#48BB78]',
        text: 'text-[#2F855A]'
      },
      IT: { bg: 'bg-[#F0F7FF]', badge: 'bg-[#4299E1]', text: 'text-[#2B6CB0]' },
      RESUME: {
        bg: 'bg-[#F8FAFC]',
        badge: 'bg-[#64748B]',
        text: 'text-[#475569]'
      },
      INTERVIEW: {
        bg: 'bg-[#EEF2FF]',
        badge: 'bg-[#6366F1]',
        text: 'text-[#4338CA]'
      },
      NETWORKING: {
        bg: 'bg-[#ECFDF5]',
        badge: 'bg-[#10B981]',
        text: 'text-[#047857]'
      },
      // Fallback
      DEFAULT: {
        bg: 'bg-[#FFFFFF]',
        badge: 'bg-[#A0AEC0]',
        text: 'text-[#4A5568]'
      }
    };

  const colors = colorMap[category?.toUpperCase() || ''] || colorMap.DEFAULT;

  return (
    <div className="cursor-pointer group">
      <Link href={getLinkPath()}>
        <div className="w-[calc(100vw-3rem)] sm:w-[384px] bg-white rounded-sm overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1">
          {/* Top Branded Section */}
          <div
            className={`relative w-full h-[331px] ${colors.bg} p-6 flex flex-col items-start overflow-hidden`}
          >
            {/* Database Image or NO IMAGE fallback */}
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

            {/* Favorite Button */}
            <button
              role="button"
              aria-label="like"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200 z-10"
              onClick={handleToggleLike}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isLiked
                    ? 'text-orange fill-orange'
                    : 'text-gray-300 hover:text-orange'
                }`}
              />
            </button>

            {/* Category Badge */}
            {category && (
              <div
                className={`relative z-50 ${colors.badge} text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
              >
                {category}
              </div>
            )}
          </div>

          {/* Bottom Info Section */}
          <div className="p-8 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1 line-clamp-1">
                {displayTitle}
              </h3>
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                {`$${
                  typeof price === 'number'
                    ? price.toLocaleString()
                    : Number(
                        String(price).replace(/[^0-9.]/g, '')
                      ).toLocaleString()
                }`}
              </span>
            </div>

            <p className="text-gray-500 text-[14px] line-clamp-2 leading-relaxed h-10">
              {description}
            </p>

            <div className="mt-2 flex items-center gap-2 text-teal font-bold text-lg hover:gap-3 transition-all duration-300">
              Learn more <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
