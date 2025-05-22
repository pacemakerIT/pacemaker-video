import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { bucketName } from '@/lib/supabase';
import prisma from '@/lib/prisma';

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
      const document = await prisma.document.findUnique({
        where: {
          id: docId
        },
        select: {
          documentId: true
        }
      });

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: document?.documentId
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
      return NextResponse.json(
        { error: 'Failed to fetch file ' + error },
        { status: 500 }
      );
    }
  };
}
