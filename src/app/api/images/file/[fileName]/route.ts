import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { imgBucketName } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    const { fileName } = await params;
    const image = await prisma.image.findFirst({
      where: { fileName }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Supabase Storage URL 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${imgBucketName}/${fileName}`;

    return NextResponse.json({
      image: {
        ...image,
        url: imageUrl
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
