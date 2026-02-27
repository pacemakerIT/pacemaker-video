import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { imgBucketName, s3clientSupabase } from '@/lib/supabase';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.mainVisual.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Main visual not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const image = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const link = formData.get('link') as string;
    const linkName = formData.get('linkName') as string;

    const updateData: Record<string, unknown> = {
      title,
      description,
      isPublic,
      startDate,
      endDate,
      startTime,
      endTime,
      link,
      linkName
    };

    if (image && typeof image === 'object' && image instanceof File) {
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
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${imgBucketName}/${fileName}`;
      updateData.thumbnail = publicUrl;
    } else if (imageUrl === '') {
      // Image was explicitly removed in the form
      updateData.thumbnail = '';
    }

    const updatedDocument = await prisma.mainVisual.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/admin/main-visual');
    revalidatePath('/');

    return NextResponse.json(updatedDocument, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update main visual' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.mainVisual.delete({
      where: { id }
    });

    revalidatePath('/admin/main-visual');
    revalidatePath('/');

    return NextResponse.json(
      { message: 'Main visual removed successfully' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove main visual' },
      { status: 500 }
    );
  }
}
