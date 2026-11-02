import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {
  parseThumbnailLocation,
  publicObjectUrl
} from './thumbnail-storage-paths.mjs';
import { planThumbnailReplacement } from './thumbnail-replacement.mjs';

// Replaces one ebook's thumbnail with a local image file and deletes the old
// storage object once nothing else references it. Dry run by default; pass
// --apply to upload, update the database, and delete the old object.
//
//   npm run db:replace-ebook-thumbnail -- --ebook=<id> --image=<file>
//   npm run db:replace-ebook-thumbnail -- --ebook=<id> --image=<file> --apply

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
const ebookId = argValue('ebook', '');
const imagePath = argValue('image', '');
const targetBucket = argValue('bucket', 'image');
const supabaseUrl = cleanEnv('NEXT_PUBLIC_SUPABASE_URL');
const connectionString = cleanEnv('DIRECT_URL') || cleanEnv('DATABASE_URL');

if (!ebookId || !imagePath) {
  throw new Error('--ebook=<id> and --image=<file> are required.');
}

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required.');
}

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
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

async function objectExists(bucket, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode !== 404) throw error;
    return false;
  }
}

// Every column that can point at an uploaded image.
async function countOtherReferences(key) {
  const where = (field) => ({ [field]: { contains: key } });
  const counts = await Promise.all([
    prisma.course.count({ where: where('thumbnailUrl') }),
    prisma.video.count({ where: where('thumbnail') }),
    prisma.workshop.count({ where: where('thumbnail') }),
    prisma.mainVisual.count({ where: where('thumbnail') }),
    prisma.instructor.count({ where: where('profileImage') }),
    prisma.user.count({ where: where('image') }),
    prisma.ebook.count({
      where: { ...where('thumbnail'), NOT: { id: ebookId } }
    })
  ]);

  return counts.reduce((sum, count) => sum + count, 0);
}

// Stops the run with a one-line message instead of a stack trace.
class UsageError extends Error {}

async function readNewImage(filePath) {
  try {
    return await stat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new UsageError(
        `Image file not found: ${filePath}. Pass the real path of the new thumbnail with --image=.`
      );
    }
    throw error;
  }
}

async function main() {
  const ebook = await prisma.ebook.findUnique({
    where: { id: ebookId },
    select: { id: true, title: true, thumbnail: true }
  });

  if (!ebook) {
    throw new UsageError(`Ebook ${ebookId} not found.`);
  }

  console.log(`${shouldApply ? 'Applying' : 'Dry run'} for ebook ${ebook.id}`);
  console.log(`  title: ${ebook.title}`);
  console.log(`  current thumbnail: ${ebook.thumbnail ?? '(none)'}`);

  const newFile = await readNewImage(imagePath);
  console.log(
    `  new image: ${imagePath} (${(newFile.size / 1024 / 1024).toFixed(2)}MB)`
  );

  await s3.send(new HeadBucketCommand({ Bucket: targetBucket }));

  const oldLocation = parseThumbnailLocation(ebook.thumbnail, supabaseUrl);
  // A bare object key lives in the image bucket, like the upload route.
  const oldBucket = oldLocation ? (oldLocation.bucket ?? targetBucket) : null;
  const oldObjectExists = oldLocation
    ? await objectExists(oldBucket, oldLocation.key)
    : false;

  const plan = planThumbnailReplacement({
    newFileName: path.basename(imagePath),
    newFileBytes: newFile.size,
    oldLocation,
    oldObjectExists,
    otherReferences: oldLocation
      ? await countOtherReferences(oldLocation.key)
      : 0
  });

  if (!plan.ok) {
    throw new UsageError(plan.reason);
  }

  console.log(
    plan.deleteOldObject
      ? `  old object ${oldBucket}/${oldLocation.key} will be deleted`
      : `  old object kept: ${plan.keepReason}`
  );

  if (!shouldApply) {
    console.log('Dry run only. Re-run with --apply to make these changes.');
    return;
  }

  const newKey = `${randomUUID()}.${plan.extension}`;
  const newUrl = publicObjectUrl(supabaseUrl, targetBucket, newKey);

  await s3.send(
    new PutObjectCommand({
      Bucket: targetBucket,
      Key: newKey,
      Body: await readFile(imagePath),
      ContentType: plan.contentType
    })
  );
  console.log(`  uploaded ${targetBucket}/${newKey}`);

  await prisma.$transaction([
    prisma.image.create({ data: { fileName: newKey, url: newUrl } }),
    prisma.ebook.update({
      where: { id: ebook.id },
      data: { thumbnail: newUrl }
    })
  ]);
  console.log(`  ebook thumbnail -> ${newUrl}`);

  // The database already points at the new image, so a failure past this
  // point only leaves an unused object behind.
  if (plan.deleteOldObject) {
    await s3.send(
      new DeleteObjectCommand({ Bucket: oldBucket, Key: oldLocation.key })
    );
    const { count } = await prisma.image.deleteMany({
      where: { fileName: oldLocation.key }
    });
    console.log(
      `  deleted ${oldBucket}/${oldLocation.key} and ${count} Image row(s)`
    );
  }

  console.log('Done.');
}

try {
  await main();
} catch (error) {
  if (!(error instanceof UsageError)) throw error;
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
