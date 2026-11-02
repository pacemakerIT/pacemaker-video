import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import prisma from '@/lib/prisma';
import { getEbookFileLocation } from '@/lib/ebook-file-location';
import { getEbookAccessForClerkUserId } from '@/lib/entitlements';

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
    { params }: { params: Promise<{ docId: string }> }
  ) {
    const docData = await params;
    const docId = docData.docId;
    const session = await auth();

    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!docId) {
      return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    }

    try {
      const ebook = await prisma.ebook.findUnique({
        where: {
          id: docId
        },
        select: {
          id: true,
          ebookId: true,
          bucketUrl: true,
          price: true,
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

      const location = getEbookFileLocation(ebook);
      if (!location) {
        return NextResponse.json(
          { error: 'Ebook file not found' },
          { status: 404 }
        );
      }

      const command = new GetObjectCommand({
        Bucket: location.bucket,
        Key: location.key
      });

      const response = await s3Client.send(command);
      const stream = response.Body as Readable;

      // Make sure browsers can read the pdf file
      const webStream = nodeReadableToWebReadable(stream);

      return new NextResponse(webStream, {
        headers: {
          'Content-Type': 'application/pdf'
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchKey') {
        return NextResponse.json(
          { error: 'Ebook file not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch file ' + error },
        { status: 500 }
      );
    }
  };
}
