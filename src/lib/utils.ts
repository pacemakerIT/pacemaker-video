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
  // Use any available image source, preferring thumbnail
  const src = (thumbnail || thumbnailUrl || imageUrl)?.trim();

  if (!src) {
    // Item type based default fallbacks
    if (itemType === ItemType.VIDEO || itemType === ItemType.COURSE) {
      return '/img/course_image1.png';
    }
    if (itemType === ItemType.EBOOK) {
      return '/img/ebook_image1.png';
    }
    return '';
  }

  // 1. Local path check
  if (src.startsWith('/') || src.startsWith('./')) {
    return src;
  }

  // 2. Full URL check
  if (src.startsWith('http')) {
    // If it's a Supabase public URL, we route it through our proxy
    if (src.includes('/storage/v1/object/public/')) {
      return `/api/images/proxy?url=${encodeURIComponent(src)}`;
    }
    return src;
  }

  // 3. Assume it's a raw Supabase object key if it doesn't match above patterns
  // We construct a full Supabase public URL and then proxy it
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_S3_IMG_BUCKET || 'image';

  if (supabaseUrl && src) {
    const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${src}`;
    return `/api/images/proxy?url=${encodeURIComponent(fullUrl)}`;
  }

  return src;
}
