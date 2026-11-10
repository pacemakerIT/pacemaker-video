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

export function publicObjectUrl(
  supabaseUrl: string,
  bucket: string,
  key: string
) {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');

  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodedKey}`;
}

// The seed never talks to storage. In dev mode it stores URLs of files that
// scripts/prepare-dev-seed-files.mjs copied into the -dev buckets; in local
// mode it falls back to /img paths and empty ebook files.
export type SeedStorage =
  | {
      mode: 'dev';
      supabaseUrl: string;
      imageBucket: string;
      ebookBucket: string;
    }
  | { mode: 'local'; reason: string };

const isDevBucket = (name: string) => name.endsWith('-dev');

export function resolveSeedStorage(
  env: Record<string, string | undefined>
): SeedStorage {
  const clean = (key: string) =>
    (env[key]?.trim() ?? '').replace(/^['"](.*)['"]$/, '$1');
  const supabaseUrl = clean('NEXT_PUBLIC_SUPABASE_URL');
  const imageBucket = clean('SUPABASE_S3_IMG_BUCKET');
  const ebookBucket = clean('SUPABASE_S3_EBOOK_BUCKET');

  if (!supabaseUrl) {
    return { mode: 'local', reason: 'NEXT_PUBLIC_SUPABASE_URL is not set' };
  }
  if (!isDevBucket(imageBucket) || !isDevBucket(ebookBucket)) {
    return {
      mode: 'local',
      reason: `SUPABASE_S3_IMG_BUCKET and SUPABASE_S3_EBOOK_BUCKET must both end with -dev (got "${imageBucket}", "${ebookBucket}")`
    };
  }
  if (imageBucket === ebookBucket) {
    return {
      mode: 'local',
      reason: 'the image and ebook buckets must differ'
    };
  }
  return { mode: 'dev', supabaseUrl, imageBucket, ebookBucket };
}

// Public URL of a seed file in its -dev bucket, or null in local mode.
export function seedFileUrl(
  storage: SeedStorage,
  role: 'image' | 'ebook',
  key: string
) {
  if (storage.mode !== 'dev') return null;
  const bucket = role === 'image' ? storage.imageBucket : storage.ebookBucket;
  return publicObjectUrl(storage.supabaseUrl, bucket, key);
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Whole days to add to every workshop so the latest one starts
// `leadDays` after `now`, keeping the gaps and times of day between them.
export function workshopDayShift(startDates: Date[], now: Date, leadDays = 7) {
  if (startDates.length === 0) return 0;
  const latest = Math.max(...startDates.map((date) => date.getTime()));
  return Math.ceil((now.getTime() + leadDays * DAY_MS - latest) / DAY_MS);
}

export function shiftDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

// Status shown for a seeded workshop: ended ones are completed.
export function seededWorkshopStatus(endDate: Date, now: Date) {
  return endDate < now ? 'COMPLETED' : 'OPEN';
}
