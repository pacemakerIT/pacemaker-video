import { S3Client } from '@aws-sdk/client-s3';
import { createGetHandler } from './handler';

const supabase = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPABASE_S3_REGION!,
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY!
  }
});

export const GET = createGetHandler(supabase);
