import { S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

// 클라이언트 사이드 Supabase 클라이언트 (공개 API만 접근 가능)
export const createClientSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL or Anon Key is not defined in environment variables.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

const cleanEnv = (key: string) => {
  const val = process.env[key];
  if (!val) return '';
  return val.replace(/^['"](.*)['"]$/, '$1');
};

export const s3clientSupabase = new S3Client({
  forcePathStyle: true,
  region: cleanEnv('SUPABASE_S3_REGION') || 'ca-central-1',
  endpoint: cleanEnv('SUPABASE_S3_ENDPOINT'),
  credentials: {
    accessKeyId: cleanEnv('SUPABASE_S3_ACCESS_KEY'),
    secretAccessKey: cleanEnv('SUPABASE_S3_SECRET_KEY')
  }
});

export const bucketName =
  cleanEnv('SUPABASE_S3_BUCKET') || cleanEnv('SUPABASE_S3_IMG_BUCKET') || '';
export const imgBucketName = cleanEnv('SUPABASE_S3_IMG_BUCKET') || '';

// 서버 사이드 Supabase 클라이언트 (서비스 롤 키로 더 많은 권한)
// export const createServerSupabase = () => {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//   if (!supabaseUrl || !supabaseServiceKey) {
//     throw new Error(
//       'Supabase URL or Anon Key is not defined in environment variables.'
//     );
//   }

//   return createClient(supabaseUrl!, supabaseServiceKey!);
// };
