import nextEnv from '@next/env';
import { PrismaClient, WorkshopStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { isPlaceholderValue, isStaleWorkshop } from './content-data-checks.mjs';
import { publicObjectUrl } from './thumbnail-storage-paths.mjs';

// One-off cleanup of production content data (2026-11):
// - points every ebook's bucketUrl at a PDF in the ebook bucket, replacing
//   the old seed's example-bucket URLs (the app fell back to ebookId, and only
//   ebook-1 and ebook-2 exist as objects)
// - deletes Image rows whose URL uses the undefined bucket (no file exists)
// - marks ended workshops still shown as Open/Closed as Completed
// Product ids are kept, so orders and purchased-content access are untouched.
// Dry run by default; pass --apply to write in one transaction.
//
//   npm run db:cleanup-production-content
//   npm run db:cleanup-production-content -- --apply
//
// Set DIRECT_URL and SUPABASE_S3_EBOOK_BUCKET for the command to target the
// production database and the production ebook bucket.

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function cleanEnv(key) {
  return (process.env[key]?.trim() ?? '').replace(/^['"](.*)['"]$/, '$1');
}

// Chosen from the PDFs in the production ebook bucket; ebook-1 and ebook-2
// keep the files they already open.
const EBOOK_FILES = {
  'ebook-1': 'ebook-1',
  'ebook-2': 'ebook-2',
  'ebook-3': 'ebooks/70ae8c6c-8159-464d-a02e-0dfe959a7af2.pdf',
  'ebook-4': 'b16eceb6-8fc2-485d-ae1c-aa58cef31e0a.pdf',
  'ebook-5': 'TEST_2025052603 - 254926 16:49:24',
  'ebook-6': 'Celpip_template.pdf'
};

const connectionString = cleanEnv('DIRECT_URL') || cleanEnv('DATABASE_URL');
const supabaseUrl = cleanEnv('NEXT_PUBLIC_SUPABASE_URL');
const ebookBucket = cleanEnv('SUPABASE_S3_EBOOK_BUCKET');
const shouldApply = process.argv.includes('--apply');

if (!connectionString || !supabaseUrl || !ebookBucket) {
  throw new Error(
    'DIRECT_URL or DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_S3_EBOOK_BUCKET are required.'
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

async function assertPdfExists(key) {
  let head;
  try {
    head = await s3.send(
      new HeadObjectCommand({ Bucket: ebookBucket, Key: key })
    );
  } catch {
    throw new Error(
      `${ebookBucket}/${key} does not exist. EBOOK_FILES lists production files; set SUPABASE_S3_EBOOK_BUCKET to the production ebook bucket.`
    );
  }
  if (head.ContentType !== 'application/pdf') {
    throw new Error(`${ebookBucket}/${key} is ${head.ContentType}, not a PDF`);
  }
}

try {
  console.log(`Database host: ${new URL(connectionString).hostname}`);
  console.log(`Ebook bucket: ${ebookBucket}`);

  const [ebooks, images, workshops] = await Promise.all([
    prisma.ebook.findMany({
      select: { id: true, ebookId: true, bucketUrl: true }
    }),
    prisma.image.findMany({ select: { id: true, url: true } }),
    prisma.workshop.findMany({
      select: { id: true, title: true, status: true, endDate: true }
    })
  ]);

  const ebookUpdates = [];
  for (const ebook of ebooks) {
    const key = EBOOK_FILES[ebook.ebookId];
    if (!key) {
      throw new Error(`No PDF chosen for ebook ${ebook.id} (${ebook.ebookId})`);
    }
    await assertPdfExists(key);
    const bucketUrl = publicObjectUrl(supabaseUrl, ebookBucket, key);
    if (bucketUrl !== ebook.bucketUrl) {
      ebookUpdates.push({ id: ebook.id, from: ebook.bucketUrl, to: bucketUrl });
    }
  }

  const imageDeletes = images.filter((image) => isPlaceholderValue(image.url));

  const now = new Date();
  const workshopUpdates = workshops.filter((workshop) =>
    isStaleWorkshop(workshop, now)
  );

  for (const update of ebookUpdates) {
    console.log(
      `Ebook ${update.id} bucketUrl\n  ${update.from}\n  -> ${update.to}`
    );
  }
  for (const image of imageDeletes) {
    console.log(`Image ${image.id} delete (${image.url})`);
  }
  for (const workshop of workshopUpdates) {
    console.log(
      `Workshop ${workshop.id} "${workshop.title}" ended ${workshop.endDate.toISOString().slice(0, 10)}: ${workshop.status} -> COMPLETED`
    );
  }

  const changes =
    ebookUpdates.length + imageDeletes.length + workshopUpdates.length;

  if (!shouldApply) {
    console.log(
      `\nDry run only. Re-run with --apply to make ${changes} change(s).`
    );
  } else {
    await prisma.$transaction([
      ...ebookUpdates.map((update) =>
        prisma.ebook.update({
          where: { id: update.id },
          data: { bucketUrl: update.to }
        })
      ),
      prisma.image.deleteMany({
        where: { id: { in: imageDeletes.map((image) => image.id) } }
      }),
      prisma.workshop.updateMany({
        where: { id: { in: workshopUpdates.map((workshop) => workshop.id) } },
        data: { status: WorkshopStatus.COMPLETED }
      })
    ]);
    console.log(`\nApplied ${changes} change(s).`);
  }
} finally {
  await prisma.$disconnect();
}
