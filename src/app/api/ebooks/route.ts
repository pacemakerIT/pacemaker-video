import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isMainParam = searchParams.get('isMain');

  try {
    const ebookList = await prisma.ebook.findMany({
      where: {
        ...(isMainParam === 'true' ? { isMain: true } : {})
      },
      orderBy: {
        orderKey: 'asc'
      }
    });

    const ebooks = ebookList.map((ebook) => ({
      id: ebook.id,
      title: ebook.title || 'Untitled',
      description: ebook.description || '',
      category: ebook.category || 'DEFAULT',
      price: ebook.price || 0,
      thumbnail: ebook.thumbnail || ''
    }));

    return NextResponse.json(ebooks);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to fetch ebooks', details: errorMessage },
      { status: 500 }
    );
  }
}
