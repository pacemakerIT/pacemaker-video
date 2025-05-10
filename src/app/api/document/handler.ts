import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

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
  return async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('filePath');
    const bucketName = searchParams.get('bucketName');
    const session = await auth();

    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!filePath || !bucketName) {
      return NextResponse.json(
        { error: 'Missing filePath or bucketName' },
        { status: 400 }
      );
    }

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: filePath
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
