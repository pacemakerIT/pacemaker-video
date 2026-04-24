import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isMainParam = searchParams.get('isMain');

  try {
    const documents = await prisma.document.findMany({
      where: {
        isPublic: true,
        ...(isMainParam === 'true' ? { isMain: true } : {})
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });
    const ebooks = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      price: doc.price,
      thumbnail: doc.thumbnail
    }));

    return NextResponse.json(ebooks);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch ebooks' },
      { status: 500 }
    );
  }
}
