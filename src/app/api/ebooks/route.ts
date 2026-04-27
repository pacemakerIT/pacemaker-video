import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isMainParam = searchParams.get('isMain');

  try {
    const ebookRecords = await prisma.ebook.findMany({
      where: {
        isPublic: true,
        ...(isMainParam === 'true' ? { isMain: true } : {})
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });
    const ebooks = ebookRecords.map((ebook) => ({
      id: ebook.id,
      title: ebook.title,
      summary: ebook.description,
      category: ebook.category,
      price: ebook.price,
      thumbnail: ebook.thumbnail
    }));

    return NextResponse.json(ebooks);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch ebooks' },
      { status: 500 }
    );
  }
}
