import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { format } from 'date-fns';
import prisma from '@/lib/prisma';
import { bucketName, s3clientSupabase } from '@/lib/supabase';

// Get all documents
export async function GET() {
  try {
    const documents = await prisma.document.findMany();
    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch documents: ${error}` },
      { status: 500 }
    );
  }
}

// Upload new document
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('document') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price')
      ? parseFloat(formData.get('price') as string)
      : null;

    const now = new Date();
    const timeStamp = format(now, 'yymmdd HH:mm:ss');
    const titleWithTimestamp = `${title} - ${timeStamp}`;

    if (!file) {
      return NextResponse.json({ error: 'File Not Found' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: titleWithTimestamp,
      Body: buffer,
      ContentType: file.type
    });

    await s3clientSupabase.send(putCommand);

    const signedUrl = await getSignedUrl(s3clientSupabase, putCommand, {
      expiresIn: 3600
    });

    const newDocument = await prisma.document.create({
      data: {
        documentId: titleWithTimestamp,
        title,
        description,
        price,
        bucketUrl: signedUrl
      }
    });

    return NextResponse.json(
      { message: 'File uploaded successfully', document: newDocument },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Server error, ${error}` },
      { status: 500 }
    );
  }
}
