// Pure helpers for scripts/prepare-dev-seed-files.mjs, kept separate so they
// can be tested without storage.

export const isDevBucket = (name) =>
  typeof name === 'string' && /-dev$/.test(name);

// Pairs every file in prisma/seed-files.json with the production bucket it
// is copied from and the -dev bucket it is copied to. Refuses targets that
// are not -dev buckets, so the script can never write to production storage.
export function planDevCopies(files, buckets) {
  const { imageSource, ebookSource, imageTarget, ebookTarget } = buckets;
  for (const [role, target] of [
    ['image', imageTarget],
    ['ebook', ebookTarget]
  ]) {
    if (!isDevBucket(target)) {
      throw new Error(
        `The ${role} target bucket must end with -dev, got "${target ?? ''}".`
      );
    }
  }
  if (imageTarget === ebookTarget) {
    throw new Error('The image and ebook target buckets must differ.');
  }
  if (isDevBucket(imageSource) || isDevBucket(ebookSource)) {
    throw new Error('Source buckets must be the production buckets.');
  }

  return [
    ...files.images.map((key) => ({
      key,
      source: imageSource,
      target: imageTarget
    })),
    ...files.documents.map((key) => ({
      key,
      source: ebookSource,
      target: ebookTarget
    }))
  ];
}

// CopyObject takes the source as "bucket/key" with each path segment
// URL-encoded (keys here contain spaces and colons).
export function copySource(bucket, key) {
  return `${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
}
