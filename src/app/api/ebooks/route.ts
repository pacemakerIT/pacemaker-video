import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      where: {
        isPublic: true
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    const ebooks = documents.map((doc) => ({
      id: doc.documentId,
      title: doc.title,
      summary: doc.description,
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
