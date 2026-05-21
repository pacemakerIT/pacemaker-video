import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemType } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageSrc({
  thumbnail,
  imageUrl,
  thumbnailUrl,
  itemType
}: {
  thumbnail?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  itemType?: ItemType;
}) {
  const normalizeImage = (src?: string | null) => {
    if (!src) return '';
    if (src.startsWith('/')) return src;
    if (/^https?:\/\//i.test(src)) {
      return `/api/images/proxy?url=${encodeURIComponent(src)}`;
    }
    return `/api/images/proxy?fileName=${encodeURIComponent(src)}`;
  };

  const resolvedImage = normalizeImage(thumbnail || thumbnailUrl || imageUrl);
  if (resolvedImage) return resolvedImage;

  // Item type based default fallbacks
  if (itemType === ItemType.VIDEO || itemType === ItemType.COURSE) {
    return '/img/course_image1.png';
  }
  if (itemType === ItemType.EBOOK) {
    return '/img/ebook-default.png';
  }
  if (itemType === ItemType.WORKSHOP) {
    return '/img/workshop-card.svg';
  }

  return '';
}
