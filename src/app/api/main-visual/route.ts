import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { imgBucketName, s3clientSupabase } from '@/lib/supabase';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

// Get all main visuals
export async function GET() {
  try {
    const visuals = await prisma.mainVisual.findMany({
      orderBy: { orderIndex: 'asc' }
    });
    return NextResponse.json(visuals, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch main visuals: ${error}` },
      { status: 500 }
    );
  }
}

// Create new document or mark existing?
// For this admin, we create a specialized Main Visual Document.
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('status') === 'public';
    const startDate = formData.get('startDate')
      ? new Date(formData.get('startDate') as string)
      : null;
    const endDate = formData.get('endDate')
      ? new Date(formData.get('endDate') as string)
      : null;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const image = formData.get('image') as File;
    const link = formData.get('link') as string;
    const linkName = formData.get('linkName') as string;

    let imageUrl = '';

    if (image && typeof image === 'object') {
      const now = new Date();
      const timeStamp = format(now, 'yyyyMMdd_HHmmss');
      const cleanFileName = image.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `main-visual/${timeStamp}_${cleanFileName}`;

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const putCommand = new PutObjectCommand({
        Bucket: imgBucketName,
        Key: fileName,
        Body: buffer,
        ContentType: image.type
      });

      await s3clientSupabase.send(putCommand);

      // Construct public URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      imageUrl = `${supabaseUrl}/storage/v1/object/public/${imgBucketName}/${fileName}`;
    }

    // Get max orderIndex
    const lastItem = await prisma.mainVisual.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const newOrderIndex = (lastItem?.orderIndex ?? 0) + 1;

    const document = await prisma.mainVisual.create({
      data: {
        title,
        description,
        isPublic,
        startDate,
        endDate,
        startTime,
        endTime,
        thumbnail: imageUrl,
        link,
        linkName,
        orderIndex: newOrderIndex
      }
    });

    revalidatePath('/admin/main-visual');
    revalidatePath('/');

    return NextResponse.json(document, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create main visual' },
      { status: 500 }
    );
  }
}
