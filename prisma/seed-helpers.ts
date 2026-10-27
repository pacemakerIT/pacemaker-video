// Pure helpers for prisma/seed.ts, kept separate so they can be tested
// without touching a database.

// The seed deletes and recreates content tables, so it only runs against a
// database on this machine or the dev Docker container (docker-compose.yml).
const LOCAL_DATABASE_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
  'host.docker.internal',
  'pacemaker-dev-postgres'
]);

export function getDatabaseHost(connectionString: string): string | null {
  try {
    return new URL(connectionString).hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

export function isLocalSeedDatabase(connectionString: string) {
  const host = getDatabaseHost(connectionString);
  return host !== null && LOCAL_DATABASE_HOSTS.has(host);
}

export function maskConnectionString(connectionString: string) {
  return connectionString.replace(/:\/\/([^:/@]+):([^@]+)@/, '://$1:****@');
}

// Same limit as MAX_IMAGE_UPLOAD_BYTES in src/lib/image-upload-limits.ts.
export const MAX_SEED_IMAGE_BYTES = 4 * 1024 * 1024;

export type StorageObject = {
  key: string;
  size: number;
};

// Thumbnails must be images the image proxy and Vercel image optimization
// can serve, so oversized files are skipped. Sorted for repeatable seeds.
export function selectSeedImageKeys(objects: StorageObject[]) {
  return objects
    .filter(
      ({ key, size }) =>
        /\.(png|jpe?g|webp)$/i.test(key) &&
        size > 0 &&
        size <= MAX_SEED_IMAGE_BYTES
    )
    .map(({ key }) => key)
    .sort();
}

// Ebook files in the ebook bucket; existing keys have no extension, so only
// folder markers and empty or hidden objects are skipped.
export function selectSeedEbookKeys(objects: StorageObject[]) {
  return objects
    .filter(({ key, size }) => {
      const name = key.split('/').pop() ?? '';
      return size > 0 && name.length > 0 && !name.startsWith('.');
    })
    .map(({ key }) => key)
    .sort();
}

export function publicObjectUrl(
  supabaseUrl: string,
  bucket: string,
  key: string
) {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');

  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodedKey}`;
}

// Hands out items in order, wrapping around.
export function createCyclicPicker<T>(items: T[]) {
  let index = 0;

  return (): T | undefined => {
    if (items.length === 0) return undefined;
    const item = items[index % items.length];
    index += 1;
    return item;
  };
}
