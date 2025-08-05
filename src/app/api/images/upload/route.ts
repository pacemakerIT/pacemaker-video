import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { imgBucketName, s3clientSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'File Not Found' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const uuid = uuidv4();
    const fileName = `${uuid}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putCommand = new PutObjectCommand({
      Bucket: imgBucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type
    });

    await s3clientSupabase.send(putCommand);

    // get signed URL for the uploaded image (expires in 1 hour)
    const signedUrl = await getSignedUrl(s3clientSupabase, putCommand, {
      expiresIn: 3600
    });

    // DB에 저장 (prisma.image 테이블이 있다고 가정)
    const newImage = await prisma.image.create({
      data: {
        fileName,
        url: signedUrl
      }
    });

    return NextResponse.json(
      { message: 'Image uploaded successfully', image: newImage },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Server error, ${error}` },
      { status: 500 }
    );
  }
}
