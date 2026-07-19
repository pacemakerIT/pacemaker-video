import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { bucketName } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { findUserIdByClerkId, userCanAccessEbook } from '@/lib/entitlements';
import { getAdminAccessForClerkUserId } from '@/lib/admin-auth';

function nodeReadableToWebReadable(
  nodeStream: Readable
): ReadableStream<Uint8Array> {
  const reader = nodeStream[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await reader.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(new Uint8Array(value));
      }
    },
    cancel() {
      nodeStream.destroy();
    }
  });
}

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

      const adminAccess = await getAdminAccessForClerkUserId(session.userId);
      const isAdmin = adminAccess.ok;

      if (!ebook.isPublic && !isAdmin) {
        return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
      }

      const userId = isAdmin
        ? null
        : await findUserIdByClerkId(prisma, session.userId);
      const canAccessEbook =
        isAdmin || (await userCanAccessEbook(prisma, userId, ebook));

      if (!canAccessEbook) {
        return NextResponse.json(
          { error: 'Purchase required to view this ebook' },
          { status: 403 }
        );
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: ebook.ebookId
      });

      const response = await s3Client.send(command);
      const stream = response.Body as Readable;

      const webStream = nodeReadableToWebReadable(stream);

      return new NextResponse(webStream, {
        headers: {
          'Content-Type': 'application/pdf'
        }
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch file ' + error },
        { status: 500 }
      );
    }
  };
}
