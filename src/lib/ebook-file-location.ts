import { ebookBucketName } from '@/lib/supabase';

export type EbookFileLocation = {
  bucket: string;
  key: string;
};

type EbookFileRecord = {
  ebookId: string;
  bucketUrl: string | null;
};

// Like isStorageObjectKey in src/lib/image-url.ts, but without requiring a
// file extension: existing ebook objects are named like `ebook-1`.
const SAFE_OBJECT_KEY_PATTERN =
  /^(?!.*(?:^|\/)\.{1,2}(?:\/|$))[^/?#]+(?:\/[^/?#]+)*$/;

type ResolveOptions = {
  supabaseUrl: string;
  ebookBucket: string;
};

// Returns the object key when value is a public URL of an object in the
// ebook bucket of this Supabase project.
function parseEbookBucketUrl(
  value: string,
  supabaseUrl: string,
  ebookBucket: string
): string | null {
  let url: URL;
  let supabaseOrigin: string;
  try {
    url = new URL(value);
    supabaseOrigin = new URL(supabaseUrl).origin;
  } catch {
    return null;
  }

  if (url.origin !== supabaseOrigin) return null;

  const match = url.pathname.match(
    /^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
  );
  if (!match || match[1] !== ebookBucket) return null;

  let key: string;
  try {
    key = decodeURIComponent(match[2]);
  } catch {
    return null;
  }

  return SAFE_OBJECT_KEY_PATTERN.test(key) ? key : null;
}

// Ebooks created in the admin form store the uploaded PDF's public URL in
// bucketUrl, while ebookId is only a generated label (`ebook-<timestamp>`).
// Ebooks uploaded through /api/document use ebookId as the object key and
// keep a signed upload URL in bucketUrl, so fall back to ebookId for those.
// Only the ebook bucket is ever read, whatever bucketUrl points at.
export function resolveEbookFileLocation(
  ebook: EbookFileRecord,
  { supabaseUrl, ebookBucket }: ResolveOptions
): EbookFileLocation | null {
  if (!ebookBucket) return null;

  const keyFromUrl =
    ebook.bucketUrl && supabaseUrl
      ? parseEbookBucketUrl(ebook.bucketUrl, supabaseUrl, ebookBucket)
      : null;
  const key = keyFromUrl ?? ebook.ebookId;

  return key ? { bucket: ebookBucket, key } : null;
}

export function getEbookFileLocation(ebook: EbookFileRecord) {
  return resolveEbookFileLocation(ebook, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '',
    ebookBucket: ebookBucketName
  });
}
