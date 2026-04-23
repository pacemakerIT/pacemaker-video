import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { bucketName, s3clientSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // S3 GetObject 커맨드 생성
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName
    });

    // S3 Signed URL 생성
    const signedUrl = await getSignedUrl(s3clientSupabase, getCommand, {
      expiresIn: 3600 // 1시간 유효
    });

    // Signed URL로 이미지 가져오기
    const response = await fetch(signedUrl);

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(
        'Fetch from S3 signed URL failed:',
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: 'Failed to fetch image from storage' },
        { status: 404 }
      );
    }

    // 이미지 데이터를 그대로 반환
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=3600, immutable'
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Proxy image error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}
