import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ebookBucketName } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getEbookAccessForClerkUserId } from '@/lib/entitlements';

/**
 * How long a reader's signed download link stays valid. The link is a bearer
 * token for a paid file, so it is deliberately short lived.
 */
const SIGNED_URL_TTL_SECONDS = 600;

export function createGetHandler(s3Client: S3Client) {
  return async function GET(
    req: Request,
    { params }: { params: Promise<{ ebookId: string }> }
  ) {
    const ebookData = await params;
    const ebookId = ebookData.ebookId;
    const session = await auth();

    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ebookId) {
      return NextResponse.json({ error: 'Missing ebookId' }, { status: 400 });
    }

    try {
      const ebook = await prisma.ebook.findUnique({
        where: {
          id: ebookId
        },
        select: {
          id: true,
          price: true,
          ebookId: true,
          isPublic: true
        }
      });

      if (!ebook) {
        return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
      }

      const access = await getEbookAccessForClerkUserId(
        prisma,
        session.userId,
        ebook
      );

      if (!access.visible) {
        return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
      }

      if (!access.allowed) {
        return NextResponse.json(
          { error: 'Purchase required to view this ebook' },
          { status: 403 }
        );
      }

      const command = new GetObjectCommand({
        Bucket: ebookBucketName,
        Key: ebook.ebookId
      });

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: SIGNED_URL_TTL_SECONDS
      });

      // The browser downloads straight from storage, so this response must
      // never be cached or shared.
      return NextResponse.json(
        { url, expiresIn: SIGNED_URL_TTL_SECONDS },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch file ' + error },
        { status: 500 }
      );
    }
  };
}
