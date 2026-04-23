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

  // 1. Local path, proxy path and object URL check
  if (
    primaryImage.startsWith('/img/') ||
    primaryImage.startsWith('/api/') ||
    primaryImage.startsWith('blob:')
  ) {
    return primaryImage;
  }

  // 2. Remote image check (Supabase Proxy)
  return `/api/images/proxy?fileName=${encodeURIComponent(
    primaryImage.split('/').pop() || ''
  )}`;
}
