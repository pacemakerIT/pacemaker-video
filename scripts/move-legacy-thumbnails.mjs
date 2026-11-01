import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CopyObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {
  decideThumbnailAction,
  parseThumbnailLocation,
  publicObjectUrl
} from './thumbnail-storage-paths.mjs';

// Legacy course/workshop/ebook thumbnails were uploaded to the document
// bucket, but /api/images/proxy only serves the image bucket. This copies
// those objects into the image bucket (originals are kept) and points the
// thumbnail URLs at the copies. Dry run by default; pass --apply to write.
//
//   npm run db:move-legacy-thumbnails
//   npm run db:move-legacy-thumbnails -- --from=document --to=image --apply

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function cleanEnv(key) {
  return (process.env[key]?.trim() ?? '').replace(/^['"](.*)['"]$/, '$1');
}

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

const shouldApply = process.argv.includes('--apply');
const sourceBucket = argValue('from', 'document');
const targetBucket = argValue('to', 'image');
const supabaseUrl = cleanEnv('NEXT_PUBLIC_SUPABASE_URL');
const connectionString = cleanEnv('DIRECT_URL') || cleanEnv('DATABASE_URL');

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required.');
}

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
}

if (sourceBucket === targetBucket) {
  throw new Error('--from and --to must be different buckets.');
}

const s3 = new S3Client({
  forcePathStyle: true,
  region: cleanEnv('SUPABASE_S3_REGION') || 'ca-central-1',
  endpoint: cleanEnv('SUPABASE_S3_ENDPOINT'),
  credentials: {
    accessKeyId: cleanEnv('SUPABASE_S3_ACCESS_KEY'),
    secretAccessKey: cleanEnv('SUPABASE_S3_SECRET_KEY')
  }
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

const existsCache = new Map();

async function objectExists(bucket, key) {
  const cacheKey = `${bucket}/${key}`;
  if (existsCache.has(cacheKey)) return existsCache.get(cacheKey);

  let exists;
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    exists = true;
  } catch (error) {
    // Bad credentials or other failures must stop the run, not look like a
    // missing file. Missing buckets are ruled out by assertBucketExists.
    if (error?.$metadata?.httpStatusCode !== 404) throw error;
    exists = false;
  }

  existsCache.set(cacheKey, exists);
  return exists;
}

// HEAD responses have no body, so a 404 from HeadObject cannot tell a missing
// object from a missing bucket. Check the buckets once up front.
async function assertBucketExists(bucket) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (error) {
    throw new Error(`Storage bucket "${bucket}" is not accessible.`, {
      cause: error
    });
  }
}

const copiedKeys = new Set();

async function copyToTarget(key) {
  if (copiedKeys.has(key)) return;

  const copySource = [sourceBucket, ...key.split('/')]
    .map(encodeURIComponent)
    .join('/');

  await s3.send(
    new CopyObjectCommand({
      Bucket: targetBucket,
      Key: key,
      CopySource: copySource
    })
  );
  copiedKeys.add(key);
  existsCache.set(`${targetBucket}/${key}`, true);
}

async function processModel(modelName, field, rows) {
  const counts = { ok: 0, update: 0, copy: 0, missing: 0, skip: 0 };

  for (const row of rows) {
    const value = row[field];
    const location = parseThumbnailLocation(value, supabaseUrl);
    const known =
      location && [null, sourceBucket, targetBucket].includes(location.bucket);

    const action = decideThumbnailAction({
      location,
      sourceBucket,
      targetBucket,
      inTarget: known ? await objectExists(targetBucket, location.key) : false,
      inSource: known ? await objectExists(sourceBucket, location.key) : false
    });

    counts[action] += 1;
    if (action === 'skip') continue;

    console.log(`  ${modelName} ${row.id} ${location.key}: ${action}`);

    if (!shouldApply || action === 'ok' || action === 'missing') continue;

    if (action === 'copy') {
      await copyToTarget(location.key);
    }

    const nextValue = publicObjectUrl(supabaseUrl, targetBucket, location.key);
    if (nextValue !== value) {
      await prisma[modelName].update({
        where: { id: row.id },
        data: { [field]: nextValue }
      });
    }
  }

  console.log(
    `${modelName}.${field}: ${counts.ok} ok, ${counts.update} url update, ` +
      `${counts.copy} copy, ${counts.missing} missing, ${counts.skip} skipped`
  );

  return counts;
}

try {
  console.log(
    `${shouldApply ? 'Applying' : 'Dry run'}: ${sourceBucket} -> ${targetBucket}`
  );

  await assertBucketExists(sourceBucket);
  await assertBucketExists(targetBucket);

  const [courses, workshops, ebooks] = await Promise.all([
    prisma.course.findMany({ select: { id: true, thumbnailUrl: true } }),
    prisma.workshop.findMany({ select: { id: true, thumbnail: true } }),
    prisma.ebook.findMany({ select: { id: true, thumbnail: true } })
  ]);

  const results = [
    await processModel('course', 'thumbnailUrl', courses),
    await processModel('workshop', 'thumbnail', workshops),
    await processModel('ebook', 'thumbnail', ebooks)
  ];

  const total = (action) =>
    results.reduce((sum, counts) => sum + counts[action], 0);
  const changes = total('update') + total('copy');

  console.log(
    shouldApply
      ? `Applied ${changes} thumbnail change(s); copied ${copiedKeys.size} object(s).`
      : `Dry run only. Re-run with --apply to make ${changes} change(s).`
  );

  if (total('missing') > 0) {
    console.log(
      `${total('missing')} thumbnail(s) were found in neither bucket and were left unchanged.`
    );
  }
} finally {
  await prisma.$disconnect();
}
