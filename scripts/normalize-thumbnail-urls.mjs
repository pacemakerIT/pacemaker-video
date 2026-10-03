import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const connectionString =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || '';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const bucket = (
  process.env.SUPABASE_S3_IMG_BUCKET?.trim() ||
  process.env.SUPABASE_S3_BUCKET?.trim()
)?.replace(/^['"]|['"]$/g, '');
const shouldApply = process.argv.includes('--apply');

if (!supabaseUrl || !bucket) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_S3_IMG_BUCKET or SUPABASE_S3_BUCKET are required.'
  );
}

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});
const publicUrlPrefix = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/`;

function isLegacyStorageKey(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.startsWith('blob:') &&
    !/^https?:\/\//i.test(value) &&
    /^[^/?#]+(?:\/[^/?#]+)*\.[a-z0-9]+$/i.test(value)
  );
}

function normalize(value) {
  return isLegacyStorageKey(value)
    ? `${publicUrlPrefix}${value}`
    : value;
}

async function updateModel(modelName, field, rows) {
  const updates = rows
    .map((row) => ({ id: row.id, value: normalize(row[field]) }))
    .filter(({ value }, index) => value !== rows[index][field]);

  console.log(`${modelName}.${field}: ${updates.length} legacy value(s)`);

  if (!shouldApply) return 0;

  for (const update of updates) {
    await prisma[modelName].update({
      where: { id: update.id },
      data: { [field]: update.value }
    });
  }

  return updates.length;
}

try {
  const [courses, workshops, ebooks] = await Promise.all([
    prisma.course.findMany({ select: { id: true, thumbnailUrl: true } }),
    prisma.workshop.findMany({ select: { id: true, thumbnail: true } }),
    prisma.ebook.findMany({ select: { id: true, thumbnail: true } })
  ]);

  const updated =
    (await updateModel('course', 'thumbnailUrl', courses)) +
    (await updateModel('workshop', 'thumbnail', workshops)) +
    (await updateModel('ebook', 'thumbnail', ebooks));

  console.log(
    shouldApply
      ? `Applied ${updated} thumbnail URL update(s).`
      : `Dry run only. Re-run with --apply to update ${updated} value(s).`
  );
} finally {
  await prisma.$disconnect();
}
