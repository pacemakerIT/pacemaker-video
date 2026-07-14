import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import prisma from '@/lib/prisma';
import { bucketName, imgBucketName, s3clientSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let rawUrl = searchParams.get('url');
    const fileName = searchParams.get('fileName');

    if (!rawUrl && fileName) {
      const image = await prisma.image.findFirst({
        where: { fileName }
      });

      rawUrl =
        image?.url ||
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${
          imgBucketName || bucketName
        }/${fileName}`;
    }

    if (!rawUrl) {
      return NextResponse.json(
        { error: 'url or fileName param is required' },
        { status: 400 }
      );
    }

    let decodedUrl = rawUrl;
    try {
      decodedUrl = decodeURIComponent(rawUrl);
    } catch {
      decodedUrl = rawUrl;
    }

    const isExternalUrl = /^https?:\/\//i.test(decodedUrl);

    // Parse Supabase public URL: .../object/public/[bucket]/[path]
    const match = decodedUrl.match(/\/object\/public\/([^/]+)\/(.+)/);
    let targetBucket = bucketName;
    let filePath = decodedUrl;

    if (match) {
      targetBucket = match[1];
      filePath = match[2];
    } else if (isExternalUrl) {
      const response = await fetch(decodedUrl);

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch external image' },
          { status: 404 }
        );
      }

      const imageBuffer = await response.arrayBuffer();

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/png',
          'Cache-Control': 'public, max-age=3600, immutable'
        }
      });
    }

    // S3 GetObject 커맨드 생성
    const getCommand = new GetObjectCommand({
      Bucket: targetBucket,
      Key: filePath
    });

    const signedUrl = await getSignedUrl(s3clientSupabase, getCommand, {
      expiresIn: 3600
    });

    const response = await fetch(signedUrl);

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(
        'Fetch from S3 signed URL failed:',
        response.status,
        response.statusText,
        'Bucket:',
        targetBucket,
        'Key:',
        filePath
      );
      return NextResponse.json(
        { error: 'Failed to fetch image from storage' },
        { status: 404 }
      );
    }

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
