import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemType } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageSrc({
  thumbnail,
  imageUrl,
  thumbnailUrl
}: {
  thumbnail?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  itemType?: ItemType;
}) {
  const primaryImage = thumbnail || thumbnailUrl || imageUrl;

  if (!primaryImage) {
    return undefined;
  }

  // 2. Remote thumbnail check (Supabase Proxy)
  if (thumbnail) {
    return `/api/images/proxy?url=${encodeURIComponent(thumbnail)}`;
  }

  // 3. Local path, proxy path and object URL check
  if (
    primaryImage.startsWith('/img/') ||
    primaryImage.startsWith('/api/') ||
    primaryImage.startsWith('blob:')
  ) {
    return primaryImage;
  }

  // 4. Default fallback to proxy using url parameter
  return `/api/images/proxy?url=${encodeURIComponent(primaryImage)}`;
}
