// Same rule as isStorageObjectKey in src/lib/image-url.ts.
const STORAGE_OBJECT_KEY_PATTERN =
  /^(?!.*(?:^|\/)\.{1,2}(?:\/|$))[^/?#]+(?:\/[^/?#]+)*\.[a-z0-9]+$/i;

export function isStorageObjectKey(value) {
  return (
    typeof value === 'string' &&
    STORAGE_OBJECT_KEY_PATTERN.test(value) &&
    !value.startsWith('/') &&
    !value.startsWith('blob:') &&
    !/^https?:\/\//i.test(value)
  );
}

// Returns { bucket, key } for a Supabase public object URL or a bare object
// key (bucket is null), or null for anything else (external URLs, paths).
export function parseThumbnailLocation(value, supabaseUrl) {
  if (typeof value !== 'string' || value.length === 0) return null;

  if (isStorageObjectKey(value)) {
    return { bucket: null, key: value };
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.origin !== new URL(supabaseUrl).origin) return null;

  const match = url.pathname.match(
    /^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
  );
  if (!match) return null;

  let key;
  try {
    key = decodeURIComponent(match[2]);
  } catch {
    return null;
  }

  return isStorageObjectKey(key) ? { bucket: match[1], key } : null;
}

export function publicObjectUrl(supabaseUrl, bucket, key) {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');

  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodedKey}`;
}

// Decides what to do with one thumbnail so that it ends up served from the
// target bucket:
// - ok: already a target-bucket URL and the object is there
// - update: the object is in the target bucket; only the URL changes
// - copy: copy the object from the source bucket, then point the URL at it
// - missing: the object is in neither bucket; leave the row alone
// - skip: not a thumbnail stored in the source or target bucket
export function decideThumbnailAction({
  location,
  sourceBucket,
  targetBucket,
  inTarget,
  inSource
}) {
  if (!location) return 'skip';
  if (
    location.bucket !== null &&
    location.bucket !== sourceBucket &&
    location.bucket !== targetBucket
  ) {
    return 'skip';
  }

  const pointsAtTarget = location.bucket === targetBucket;

  if (inTarget) return pointsAtTarget ? 'ok' : 'update';
  if (inSource) return 'copy';
  return 'missing';
}
