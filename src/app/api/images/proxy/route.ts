import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import prisma from '@/lib/prisma';
import { imgBucketName, s3clientSupabase } from '@/lib/supabase';
import { isStorageObjectKey } from '@/lib/image-url';
import { readImageResponse } from '@/lib/image-response';

const ALLOWED_EXTERNAL_IMAGE_HOSTS = new Set([
  'fast.wistia.net',
  'embedwistia-a.akamaihd.net'
]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let rawUrl = searchParams.get('url');
    const fileName = searchParams.get('fileName');
    const lookedUpByFileName = !rawUrl && Boolean(fileName);

    if (!rawUrl && fileName) {
      const image = await prisma.image.findFirst({
        where: { fileName }
      });

      // Some content stores only the storage key, without an Image row.
      // The storage-key validator below keeps this fallback within the image bucket.
      rawUrl = image?.url || fileName;
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

    const isUrl = /^[a-z][a-z0-9+.-]*:/i.test(decodedUrl);
    const imageBucket = imgBucketName;
    const allowedBuckets = new Set([imageBucket].filter(Boolean));
    let targetBucket = imageBucket;
    let filePath = decodedUrl;

    if (isUrl) {
      let imageUrl: URL;
      try {
        imageUrl = new URL(decodedUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid image URL' },
          { status: 400 }
        );
      }
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '';
      const isSupabaseUrl = imageUrl.hostname === supabaseHost;

      if (
        imageUrl.protocol !== 'https:' ||
        imageUrl.username ||
        imageUrl.password ||
        imageUrl.port
      ) {
        return NextResponse.json(
          { error: 'Unsupported image URL' },
          { status: 400 }
        );
      }

      if (!isSupabaseUrl) {
        if (!ALLOWED_EXTERNAL_IMAGE_HOSTS.has(imageUrl.hostname)) {
          return NextResponse.json(
            { error: 'Unsupported image URL' },
            { status: 400 }
          );
        }

        const externalResponse = await fetch(imageUrl, {
          signal: AbortSignal.timeout(8000),
          redirect: 'error'
        });
        if (!externalResponse.ok) {
          return NextResponse.json(
            { error: 'Failed to fetch external image' },
            { status: 404 }
          );
        }

        const imageResult = await readImageResponse(externalResponse);
        if (!imageResult.ok) {
          return NextResponse.json(
            {
              error:
                imageResult.status === 413
                  ? 'Image is too large'
                  : 'Invalid image response'
            },
            { status: imageResult.status }
          );
        }

        return new NextResponse(Buffer.from(imageResult.body), {
          headers: {
            'Content-Type': imageResult.contentType,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'public, max-age=3600, immutable'
          }
        });
      }

      const storagePath = imageUrl.pathname.match(
        /^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
      );

      if (!storagePath || !allowedBuckets.has(storagePath[1])) {
        return NextResponse.json(
          { error: 'Unsupported image URL' },
          { status: 400 }
        );
      }

      targetBucket = storagePath[1];
      filePath = decodeURIComponent(storagePath[2]);
      if (!isStorageObjectKey(filePath)) {
        return NextResponse.json(
          { error: 'Invalid image path' },
          { status: 400 }
        );
      }
    } else if (isStorageObjectKey(decodedUrl) && lookedUpByFileName) {
      // Legacy records pass only the object key. These files belong in the
      // image bucket, while full Supabase public URLs are handled above.
      targetBucket = imageBucket;
      filePath = decodedUrl;
    } else {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }

    if (!targetBucket) {
      return NextResponse.json(
        { error: 'Image storage bucket is not configured' },
        { status: 503 }
      );
    }

    // S3 GetObject 커맨드 생성
    const getCommand = new GetObjectCommand({
      Bucket: targetBucket,
      Key: filePath
    });

    const signedUrl = await getSignedUrl(s3clientSupabase, getCommand, {
      expiresIn: 3600
    });

    const response = await fetch(signedUrl, {
      signal: AbortSignal.timeout(8000),
      redirect: 'error'
    });

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

    const imageResult = await readImageResponse(response);
    if (!imageResult.ok) {
      return NextResponse.json(
        {
          error:
            imageResult.status === 413
              ? 'Image is too large'
              : 'Invalid image response'
        },
        { status: imageResult.status }
      );
    }

    return new NextResponse(Buffer.from(imageResult.body), {
      headers: {
        'Content-Type': imageResult.contentType,
        'X-Content-Type-Options': 'nosniff',
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
