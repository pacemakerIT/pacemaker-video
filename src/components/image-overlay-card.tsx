import Image from 'next/image';
import { ArrowRight, Heart, Calendar, MapPin, User } from 'lucide-react';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import { useState } from 'react';
import { ItemType } from '@prisma/client';
import { resolveImageSrc } from '@/lib/utils';

export default function ImageOverlayCard({
  id,
  title,
  visualTitle2,
  category,
  startDate,
  locationOrUrl,
  status,
  description,
  thumbnail,
  thumbnailUrl,
  imageUrl
}: OnlineCards) {
  const [isLiked, setIsLiked] = useState(false);
  const imageSrc = resolveImageSrc({
    thumbnail,
    thumbnailUrl,
    imageUrl,
    itemType: ItemType.WORKSHOP
  });

  const displayTitle = title || visualTitle2 || '';
  const formattedStatus =
    status === 'RECRUITING'
      ? 'Live now'
      : status === 'CLOSED'
        ? 'Closed'
        : status === 'ONGOING'
          ? 'Ongoing'
          : status === 'COMPLETED'
            ? 'Completed'
            : status;

  function formatDateTime(dateStr: string | Date | undefined | null) {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options).replace(' at ', ',');
  }

  return (
    <div className="cursor-pointer group" data-testid="image-overlay-card">
      <Link href={`/workshops/${id}`}>
        <div className="w-full sm:w-[588px] bg-white rounded-sm overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1">
          {/* Top Orange Border */}
          <div className="h-1.5 bg-orange w-full" />

          <div className="relative w-full h-[460px]">
            <Image
              src={imageSrc}
              fill
              className="object-cover"
              alt="workshop img"
              data-testid="card-image"
            />
            {/* Dark Overlay with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Favorite Button */}
            <button
              role="button"
              aria-label="like"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200 z-10"
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isLiked
                    ? 'text-orange fill-orange'
                    : 'text-gray-400 hover:text-orange'
                }`}
              />
            </button>

            {/* Card Content */}
            <div className="absolute inset-0 flex flex-col p-8 text-white">
              {/* Category Badge */}
              {category && (
                <div className="bg-orange text-white text-[11px] font-bold px-2 py-1 rounded-sm w-fit mb-6 uppercase tracking-wider">
                  {category}
                </div>
              )}

              {/* Title */}
              <h3 className="text-[28px] font-bold text-white mb-8 leading-[1.2] line-clamp-2">
                {displayTitle}
              </h3>

              {/* Meta Info */}
              <div className="flex flex-col gap-3.5 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 opacity-70" />
                  <span>Date:{' ' + formatDateTime(startDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 opacity-70" />
                  <span>Where:{' ' + (locationOrUrl || 'Online')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 opacity-70" />
                  <span>Host:{' ' + 'TBA'}</span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <p className="mt-8 italic text-white/70 text-[15px] line-clamp-2 font-light leading-relaxed">
                  &ldquo;{description}&rdquo;
                </p>
              )}

              {/* CTA */}
              <div className="mt-auto flex items-center gap-2 text-white font-bold text-lg hover:gap-3 transition-all duration-300">
                Sign up <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Status Row */}
          <div className="py-4 bg-white flex justify-center items-center">
            <span
              className={`text-[17px] font-bold uppercase tracking-tight ${
                status === 'RECRUITING' ? 'text-orange' : 'text-gray-500'
              }`}
            >
              {formattedStatus}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
