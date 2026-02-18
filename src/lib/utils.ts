import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemType } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPABASE_URL_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function toProxyUrl(url: string): string {
  if (!SUPABASE_URL_PREFIX || !url.startsWith(SUPABASE_URL_PREFIX)) {
    return url;
  }
  return `/api/images/proxy?fileName=${encodeURIComponent(url.split('/').pop() || '')}`;
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
  // 1. Local path check
  if (thumbnail && thumbnail.startsWith('/img/')) {
    return thumbnail;
  }

  // 2. Remote thumbnail check (Supabase Proxy)
  if (thumbnail) {
    return `/api/images/proxy?fileName=${encodeURIComponent(
      thumbnail.split('/').pop() || ''
    )}`;
  }

  // 3. Fallback to thumbnailUrl or imageUrl
  const secondaryImage = thumbnailUrl || imageUrl;
  if (secondaryImage) {
    return secondaryImage;
  }

  // 4. Item type based default fallbacks
  if (itemType === ItemType.VIDEO || itemType === ItemType.COURSE) {
    return '/img/course_image1.png';
  }

  return '/img/ebook_image1.png';
}
