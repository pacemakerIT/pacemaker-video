import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CopyObjectCommand,
  HeadObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { copySource, planDevCopies } from './dev-seed-files.mjs';

// One-time setup for the seed: copies the files listed in
// prisma/seed-files.json from the production buckets into the -dev buckets
// under the same keys (server-side copy, nothing is downloaded). The seed
// itself never touches storage; it only stores URLs to these keys.
// Files already in the -dev bucket with the same size are skipped.
// Dry run by default; pass --apply to copy.
//
//   npm run storage:prepare-dev-seed-files
//   npm run storage:prepare-dev-seed-files -- --apply
//
// Targets are SUPABASE_S3_IMG_BUCKET / SUPABASE_S3_EBOOK_BUCKET and must end
// with -dev. Sources default to image / document (--source-image=,
// --source-document= to override).

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
const files = JSON.parse(
  await readFile(path.join(process.cwd(), 'prisma/seed-files.json'), 'utf8')
);
const plan = planDevCopies(files, {
  imageSource: argValue('source-image', 'image'),
  ebookSource: argValue('source-document', 'document'),
  imageTarget: cleanEnv('SUPABASE_S3_IMG_BUCKET'),
  ebookTarget: cleanEnv('SUPABASE_S3_EBOOK_BUCKET')
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

async function sizeOf(bucket, key) {
  try {
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );
    return head.ContentLength;
  } catch {
    return null;
  }
}

let copied = 0;
let pending = 0;
let missing = 0;
for (const { key, source, target } of plan) {
  const sourceSize = await sizeOf(source, key);
  const targetSize = await sizeOf(target, key);
  if (sourceSize === null) {
    missing += 1;
    console.log(`MISSING ${source}/${key} (not in the source bucket)`);
    continue;
  }
  if (targetSize === sourceSize) {
    console.log(`ok      ${target}/${key}`);
    continue;
  }

  pending += 1;
  console.log(
    `copy    ${source}/${key} -> ${target}/${key} (${(sourceSize / 1024).toFixed(0)} KB)`
  );
  if (!shouldApply) continue;

  await s3.send(
    new CopyObjectCommand({
      Bucket: target,
      Key: key,
      CopySource: copySource(source, key)
    })
  );
  if ((await sizeOf(target, key)) !== sourceSize) {
    throw new Error(`Copy check failed for ${target}/${key}`);
  }
  copied += 1;
}

console.log(
  shouldApply
    ? `\nCopied ${copied} file(s); ${missing} missing in the source.`
    : `\nDry run only. Re-run with --apply to copy ${pending} file(s); ${missing} missing in the source.`
);
process.exitCode = missing > 0 ? 1 : 0;
