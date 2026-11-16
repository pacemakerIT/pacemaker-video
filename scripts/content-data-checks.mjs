// Pure helpers for scripts/check-content-data.mjs and
// scripts/cleanup-production-content.mjs, kept separate so they can be tested
// without a database or storage.
import { parseThumbnailLocation } from './thumbnail-storage-paths.mjs';

// Values that only ever come from placeholder or broken data: the old seed's
// fake ebook URL, and uploads made while the image bucket name was unset.
const PLACEHOLDER_PATTERNS = [
  /example-bucket\.s3\.amazonaws\.com/i,
  /\/storage\/v1\/object\/public\/undefined\//i
];

export function isPlaceholderValue(value) {
  return (
    typeof value === 'string' &&
    PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
  );
}

// Classifies an image field the way the image proxy serves it:
// - empty: no image
// - local: a path under public/, served by Next.js
// - storage: an object in a Supabase bucket (bare keys belong to the image
//   bucket, like the proxy's fileName lookup)
// - other: anything the proxy does not serve from storage
export function classifyImageValue(value, supabaseUrl) {
  if (typeof value !== 'string' || value.trim() === '') {
    return { kind: 'empty' };
  }
  if (value.startsWith('/')) return { kind: 'local', path: value };

  const location = parseThumbnailLocation(value, supabaseUrl);
  if (location) {
    return { kind: 'storage', bucket: location.bucket, key: location.key };
  }
  return { kind: 'other' };
}

// Same rule as SAFE_OBJECT_KEY_PATTERN in src/lib/ebook-file-location.ts.
const SAFE_EBOOK_KEY_PATTERN =
  /^(?!.*(?:^|\/)\.{1,2}(?:\/|$))[^/?#]+(?:\/[^/?#]+)*$/;

function parseEbookBucketUrl(value, supabaseUrl, ebookBucket) {
  let url;
  let supabaseOrigin;
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

  let key;
  try {
    key = decodeURIComponent(match[2]);
  } catch {
    return null;
  }
  return SAFE_EBOOK_KEY_PATTERN.test(key) ? key : null;
}

// Same rule as resolveEbookFileLocation in src/lib/ebook-file-location.ts:
// the PDF key comes from bucketUrl when it is a public URL of the ebook
// bucket, otherwise from ebookId. usesFallback marks the second case.
export function resolveEbookFile(ebook, { supabaseUrl, ebookBucket }) {
  if (!ebookBucket) return null;

  const keyFromUrl =
    ebook.bucketUrl && supabaseUrl
      ? parseEbookBucketUrl(ebook.bucketUrl, supabaseUrl, ebookBucket)
      : null;
  const key = keyFromUrl ?? ebook.ebookId;

  return key
    ? { bucket: ebookBucket, key, usesFallback: keyFromUrl === null }
    : null;
}

// A workshop that has ended but is still shown as Open or Closed. The app
// does not update stored statuses, so these stay until someone changes them.
export function isStaleWorkshop(workshop, now) {
  return (
    (workshop.status === 'OPEN' || workshop.status === 'CLOSED') &&
    new Date(workshop.endDate) < now
  );
}
