import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const supabase = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPABASE_S3_REGION!,
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY!
  }
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('filePath');
  const bucketName = searchParams.get('bucketName');
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
  }

  const command = new GetObjectCommand({
    Bucket: bucketName!,
    Key: filePath!
  });

  const response = await supabase.send(command);
  const stream = response.Body as ReadableStream;

  // Content - Type을 PDF로 설정하여 브라우저에서 보기만 가능하게 함
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline' // 다운로드 창 없이 브라우저에서만 보기 가능
    }
  });
}
