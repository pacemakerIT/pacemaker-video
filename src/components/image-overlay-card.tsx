import Image from 'next/image';
import { ArrowRight, Heart, Calendar, MapPin, User } from 'lucide-react';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import { ItemType } from '@prisma/client';
import { resolveImageSrc } from '@/lib/utils';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { useUserContext } from '@/app/context/user-context';
import { toast } from 'sonner';

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
  const itemType = ItemType.WORKSHOP;
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();
  const { user } = useUserContext();
  const isLiked = favorites.some(
    (f) => f.itemId === id && f.itemType === itemType
  );
  const imageSrc =
    resolveImageSrc({
      thumbnail,
      thumbnailUrl,
      imageUrl,
      itemType
    }) || '/img/workshop_image1.png';

  const displayTitle = title || visualTitle2 || '';
  const statusDisplay = (() => {
    switch (status) {
      case 'OPEN':
        return {
          label: 'Open',
          cardClass: 'border-navy',
          textClass: 'text-navy'
        };
      case 'CLOSED':
        return {
          label: 'Closed',
          cardClass: 'border-teal',
          textClass: 'text-teal'
        };
      case 'COMPLETED':
        return {
          label: 'Ended',
          cardClass: 'border-slate-400 opacity-[0.85] saturate-50',
          textClass: 'text-slate-400'
        };
      default:
        return {
          label: status,
          cardClass: 'border-slate-400',
          textClass: 'text-slate-400'
        };
    }
  })();

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

  const toggleLike = () => {
    if (!user?.id) {
      toast.error('Please log in to use favorite.');
      return;
    }

    if (isLiked) {
      removeFavorite(id, itemType);
    } else {
      addFavorite(id, itemType);
    }
  };

  return (
    <div className="group cursor-pointer" data-testid="image-overlay-card">
      <Link href={`/workshops/${id}`}>
        <div className="flex w-full flex-col gap-5 transition-all duration-500 ease-out hover:-translate-y-1 sm:w-[588px]">
          <div
            className={`h-[clamp(420px,128vw,480px)] w-full flex-shrink-0 overflow-hidden border-t-[10px] bg-white shadow-card ${statusDisplay.cardClass}`}
          >
            <div className="relative h-full overflow-hidden bg-cover bg-center">
              <Image
                src={imageSrc}
                fill
                className="object-cover"
                alt="workshop img"
                data-testid="card-image"
              />
              <div className="absolute inset-0 bg-black/35" />

              <button
                role="button"
                aria-label="like"
                className="group absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-500 ease-out hover:scale-110 hover:shadow-xl"
                onClick={(e) => {
                  e.preventDefault();
                  toggleLike();
                }}
              >
                <Heart
                  className={`h-6 w-6 transition-colors duration-200 ${
                    isLiked
                      ? 'fill-orange text-orange'
                      : 'text-gray-400 group-hover:text-orange'
                  }`}
                />
              </button>

              <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
                <div>
                  {category && (
                    <div className="mb-4 inline-block bg-orange px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      {category}
                    </div>
                  )}

                  <h3 className="mt-2 font-headline text-3xl font-bold leading-tight text-white">
                    {displayTitle}
                  </h3>

                  <div className="mt-8 space-y-2 text-sm opacity-90 md:text-base">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date · {formatDateTime(startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Where · {locationOrUrl || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Host · TBA</span>
                    </div>

                    {description && (
                      <p className="pt-4 text-[0.95rem] font-medium italic opacity-85 line-clamp-2">
                        &ldquo;{description}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 text-base font-bold transition-transform duration-300 ease-out group-hover:translate-x-2">
                  Sign up <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-transparent">
            <span
              className={`text-center text-[1.05rem] font-bold tracking-wide ${statusDisplay.textClass}`}
            >
              {statusDisplay.label}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
