import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3';
import {
  classifyImageValue,
  isPlaceholderValue,
  isStaleWorkshop,
  resolveEbookFile
} from './content-data-checks.mjs';

// Read-only check that content rows point at files that exist: thumbnails in
// the image bucket, ebook PDFs in the ebook bucket. Also reports placeholder
// values and ended workshops still shown as Open/Closed. Exits with 1 when
// anything fails, so it can gate a data cleanup before and after.
//
//   npm run db:check-content
//
// Point it at another database or buckets by setting DIRECT_URL,
// SUPABASE_S3_IMG_BUCKET and SUPABASE_S3_EBOOK_BUCKET for the command.

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function cleanEnv(key) {
  return (process.env[key]?.trim() ?? '').replace(/^['"](.*)['"]$/, '$1');
}

const connectionString = cleanEnv('DIRECT_URL') || cleanEnv('DATABASE_URL');
const supabaseUrl = cleanEnv('NEXT_PUBLIC_SUPABASE_URL');
const imageBucket = cleanEnv('SUPABASE_S3_IMG_BUCKET');
const ebookBucket = cleanEnv('SUPABASE_S3_EBOOK_BUCKET');

if (!connectionString || !supabaseUrl || !imageBucket || !ebookBucket) {
  throw new Error(
    'DIRECT_URL or DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_S3_IMG_BUCKET and SUPABASE_S3_EBOOK_BUCKET are required.'
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});
const s3 = new S3Client({
  forcePathStyle: true,
  region: cleanEnv('SUPABASE_S3_REGION') || 'ca-central-1',
  endpoint: cleanEnv('SUPABASE_S3_ENDPOINT'),
  credentials: {
    accessKeyId: cleanEnv('SUPABASE_S3_ACCESS_KEY'),
    secretAccessKey: cleanEnv('SUPABASE_S3_SECRET_KEY')
  }
});

async function listKeys(bucket) {
  const keys = new Set();
  let token;
  do {
    const response = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token })
    );
    for (const item of response.Contents ?? []) {
      if (item.Key) keys.add(item.Key);
    }
    token = response.NextContinuationToken;
  } while (token);
  return keys;
}

const failures = [];
const warnings = [];

function checkImage(label, value, imageKeys) {
  if (isPlaceholderValue(value)) {
    failures.push(`${label}: placeholder value ${value}`);
    return;
  }
  const image = classifyImageValue(value, supabaseUrl);
  if (image.kind === 'other') {
    warnings.push(`${label}: not served from storage (${value})`);
  }
  if (image.kind !== 'storage') return;

  const bucket = image.bucket ?? imageBucket;
  if (bucket !== imageBucket) {
    failures.push(
      `${label}: ${bucket}/${image.key} is outside the image bucket the proxy serves`
    );
  } else if (!imageKeys.has(image.key)) {
    failures.push(`${label}: ${bucket}/${image.key} does not exist`);
  }
}

async function checkEbookFile(label, ebook) {
  if (isPlaceholderValue(ebook.bucketUrl)) {
    failures.push(`${label}: placeholder bucketUrl ${ebook.bucketUrl}`);
  }
  const file = resolveEbookFile(ebook, { supabaseUrl, ebookBucket });
  if (!file) {
    failures.push(`${label}: no ebook file location`);
    return;
  }
  if (file.usesFallback) {
    warnings.push(
      `${label}: bucketUrl is not used; reads ${file.key} via ebookId`
    );
  }
  try {
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: file.bucket, Key: file.key })
    );
    if (head.ContentType !== 'application/pdf') {
      failures.push(
        `${label}: ${file.bucket}/${file.key} is ${head.ContentType}, not a PDF`
      );
    }
  } catch {
    failures.push(`${label}: ${file.bucket}/${file.key} does not exist`);
  }
}

try {
  const host = new URL(connectionString).hostname;
  console.log(`Database host: ${host}`);
  console.log(`Buckets: image=${imageBucket}, ebook=${ebookBucket}`);

  const imageKeys = await listKeys(imageBucket);
  const [courses, videos, ebooks, workshops, instructors, visuals, images] =
    await Promise.all([
      prisma.course.findMany({ select: { id: true, thumbnailUrl: true } }),
      prisma.video.findMany({ select: { id: true, thumbnail: true } }),
      prisma.ebook.findMany({
        select: {
          id: true,
          ebookId: true,
          bucketUrl: true,
          thumbnail: true,
          isPublic: true,
          price: true
        }
      }),
      prisma.workshop.findMany({
        select: { id: true, thumbnail: true, status: true, endDate: true }
      }),
      prisma.instructor.findMany({ select: { id: true, profileImage: true } }),
      prisma.mainVisual.findMany({ select: { id: true, thumbnail: true } }),
      prisma.image.findMany({ select: { id: true, url: true } })
    ]);

  for (const row of courses)
    checkImage(`Course ${row.id} thumbnailUrl`, row.thumbnailUrl, imageKeys);
  for (const row of videos)
    checkImage(`Video ${row.id} thumbnail`, row.thumbnail, imageKeys);
  for (const row of ebooks)
    checkImage(`Ebook ${row.id} thumbnail`, row.thumbnail, imageKeys);
  for (const row of workshops)
    checkImage(`Workshop ${row.id} thumbnail`, row.thumbnail, imageKeys);
  for (const row of instructors)
    checkImage(
      `Instructor ${row.id} profileImage`,
      row.profileImage,
      imageKeys
    );
  for (const row of visuals)
    checkImage(`MainVisual ${row.id} thumbnail`, row.thumbnail, imageKeys);
  for (const row of images)
    checkImage(`Image ${row.id} url`, row.url, imageKeys);

  for (const ebook of ebooks) {
    await checkEbookFile(`Ebook ${ebook.id} (${ebook.ebookId})`, ebook);
  }

  const now = new Date();
  for (const workshop of workshops) {
    if (isStaleWorkshop(workshop, now)) {
      failures.push(
        `Workshop ${workshop.id}: ended ${workshop.endDate.toISOString().slice(0, 10)} but status is ${workshop.status}`
      );
    }
  }

  const checked =
    courses.length +
    videos.length +
    ebooks.length * 2 +
    workshops.length +
    instructors.length +
    visuals.length +
    images.length;
  for (const warning of warnings) console.log(`WARN  ${warning}`);
  for (const failure of failures) console.log(`FAIL  ${failure}`);
  console.log(
    `\nChecked ${checked} value(s): ${failures.length} failure(s), ${warnings.length} warning(s).`
  );
  process.exitCode = failures.length > 0 ? 1 : 0;
} finally {
  await prisma.$disconnect();
}
