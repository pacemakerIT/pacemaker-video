import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CopyObjectCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3';
import {
  classifyImageValue,
  resolveEbookFile
} from './content-data-checks.mjs';

// Moves objects in the image and ebook buckets that no content row
// references into the archive bucket (as <bucket>/<key>), so they can be
// restored or deleted later. Also removes empty buckets whose names look like
// uploaded files (created by uploads made while the image bucket was unset).
// An object counts as referenced when a thumbnail or ebook field resolves to
// it, or when its key appears anywhere in a content row.
// Dry run by default; pass --apply to copy, verify and delete originals.
//
//   npm run storage:archive-unreferenced
//   npm run storage:archive-unreferenced -- --apply

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function cleanEnv(key) {
  return (process.env[key]?.trim() ?? '').replace(/^['"](.*)['"]$/, '$1');
}

const ARCHIVE_BUCKET = 'archive';
const FILE_NAMED_BUCKET = /^[0-9a-f-]{36}\.(png|jpe?g|webp)$/i;
const CONTENT_TABLES = [
  'Course',
  'Video',
  'Ebook',
  'Workshop',
  'Instructor',
  'MainVisual',
  'Image',
  'Section'
];

const connectionString = cleanEnv('DIRECT_URL') || cleanEnv('DATABASE_URL');
const supabaseUrl = cleanEnv('NEXT_PUBLIC_SUPABASE_URL');
const imageBucket = cleanEnv('SUPABASE_S3_IMG_BUCKET');
const ebookBucket = cleanEnv('SUPABASE_S3_EBOOK_BUCKET');
const shouldApply = process.argv.includes('--apply');

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

async function listObjects(bucket) {
  const objects = [];
  let token;
  do {
    const response = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token })
    );
    for (const item of response.Contents ?? []) {
      if (item.Key) objects.push({ key: item.Key, size: item.Size ?? 0 });
    }
    token = response.NextContinuationToken;
  } while (token);
  return objects;
}

async function collectReferences() {
  const referenced = { [imageBucket]: new Set(), [ebookBucket]: new Set() };
  const addImage = (value) => {
    const image = classifyImageValue(value, supabaseUrl);
    if (image.kind === 'storage') {
      referenced[image.bucket ?? imageBucket]?.add(image.key);
    }
  };

  const [courses, videos, ebooks, workshops, instructors, visuals, images] =
    await Promise.all([
      prisma.course.findMany({ select: { thumbnailUrl: true } }),
      prisma.video.findMany({ select: { thumbnail: true } }),
      prisma.ebook.findMany({
        select: { ebookId: true, bucketUrl: true, thumbnail: true }
      }),
      prisma.workshop.findMany({ select: { thumbnail: true } }),
      prisma.instructor.findMany({ select: { profileImage: true } }),
      prisma.mainVisual.findMany({ select: { thumbnail: true } }),
      prisma.image.findMany({ select: { url: true } })
    ]);

  courses.forEach((row) => addImage(row.thumbnailUrl));
  videos.forEach((row) => addImage(row.thumbnail));
  workshops.forEach((row) => addImage(row.thumbnail));
  instructors.forEach((row) => addImage(row.profileImage));
  visuals.forEach((row) => addImage(row.thumbnail));
  images.forEach((row) => addImage(row.url));
  for (const ebook of ebooks) {
    addImage(ebook.thumbnail);
    const file = resolveEbookFile(ebook, { supabaseUrl, ebookBucket });
    if (file) referenced[ebookBucket].add(file.key);
  }

  // Every content row as text, so keys mentioned outside the known fields
  // (rich text, JSON) are kept too.
  const texts = [];
  for (const table of CONTENT_TABLES) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT row_to_json(t)::text AS row FROM "${table}" t`
    );
    texts.push(...rows.map((row) => row.row));
  }
  return { referenced, contentText: texts.join('\n') };
}

function isMentioned(contentText, key) {
  const encoded = key.split('/').map(encodeURIComponent).join('/');
  return contentText.includes(key) || contentText.includes(encoded);
}

async function archiveObject(bucket, { key, size }) {
  const archiveKey = `${bucket}/${key}`;
  await s3.send(
    new CopyObjectCommand({
      Bucket: ARCHIVE_BUCKET,
      Key: archiveKey,
      CopySource: `${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`
    })
  );
  const copy = await s3.send(
    new HeadObjectCommand({ Bucket: ARCHIVE_BUCKET, Key: archiveKey })
  );
  if (copy.ContentLength !== size) {
    throw new Error(`Archive copy size mismatch for ${bucket}/${key}`);
  }
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

try {
  console.log(`Database host: ${new URL(connectionString).hostname}`);
  console.log(
    `Buckets: image=${imageBucket}, ebook=${ebookBucket}, archive=${ARCHIVE_BUCKET}`
  );

  const { referenced, contentText } = await collectReferences();
  const { Buckets = [] } = await s3.send(new ListBucketsCommand({}));
  const bucketNames = Buckets.map((bucket) => bucket.Name);
  if (shouldApply && !bucketNames.includes(ARCHIVE_BUCKET)) {
    throw new Error(`Create the ${ARCHIVE_BUCKET} bucket before --apply.`);
  }

  let moved = 0;
  for (const bucket of [imageBucket, ebookBucket]) {
    const objects = await listObjects(bucket);
    const unreferenced = objects.filter(
      ({ key }) =>
        !key.endsWith('.emptyFolderPlaceholder') &&
        !referenced[bucket].has(key) &&
        !isMentioned(contentText, key)
    );
    const megabytes =
      unreferenced.reduce((sum, o) => sum + o.size, 0) / 1048576;
    console.log(
      `\n${bucket}: ${objects.length} object(s), ${referenced[bucket].size} referenced, ${unreferenced.length} to archive (${megabytes.toFixed(1)} MB)`
    );
    for (const object of unreferenced) {
      console.log(`  ${object.key}`);
      if (shouldApply) {
        await archiveObject(bucket, object);
        moved += 1;
      }
    }
  }

  const fileNamedBuckets = bucketNames.filter((name) =>
    FILE_NAMED_BUCKET.test(name)
  );
  console.log(`\nEmpty file-named buckets: ${fileNamedBuckets.length}`);
  for (const name of fileNamedBuckets) {
    const contents = await listObjects(name);
    if (contents.length > 0) {
      console.log(`  ${name} (skipped: ${contents.length} object(s))`);
      continue;
    }
    console.log(`  ${name}`);
    if (shouldApply) {
      await s3.send(new DeleteBucketCommand({ Bucket: name }));
    }
  }

  console.log(
    shouldApply
      ? `\nArchived ${moved} object(s) and removed empty file-named buckets.`
      : '\nDry run only. Re-run with --apply to archive and remove them.'
  );
} finally {
  await prisma.$disconnect();
}
