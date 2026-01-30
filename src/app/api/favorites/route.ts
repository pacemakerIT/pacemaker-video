import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ItemType } from '@prisma/client';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId)
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: {
      itemId: true,
      itemType: true
    }
  });

  const detailedFavorites = await Promise.all(
    favorites.map(async (favorite) => {
      let item = null;

      try {
        switch (favorite.itemType) {
          case ItemType.VIDEO:
            item = await prisma.video.findUnique({
              where: { videoId: favorite.itemId },
              select: {
                id: true,
                title: true,
                price: true,
                description: true,
                category: true
              }
            });
            break;
          case ItemType.DOCUMENT:
            item = await prisma.document.findUnique({
              where: { documentId: favorite.itemId },
              select: {
                id: true,
                title: true,
                price: true,
                description: true,
                category: true
              }
            });
            break;
          case ItemType.WORKSHOP:
            item = await prisma.workshop.findUnique({
              where: { id: favorite.itemId },
              select: {
                id: true,
                title: true,
                price: true,
                description: true,
                startDate: true
              }
            });
            break;
          case ItemType.COURSE:
            item = await prisma.course.findUnique({
              where: { id: favorite.itemId },
              select: {
                id: true,
                title: true,
                price: true,
                description: true,
                category: true
              }
            });
            break;
        }
      } catch (error) {
        return NextResponse.json(
          { error: `Item lookup failed: ${error}` },
          { status: 500 }
        );
      }
      return { ...favorite, ...item };
    })
  );
  return NextResponse.json(detailedFavorites);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, itemId, itemType } = body;

  if (!userId || !itemId || !itemType)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const existing = await prisma.favorite.findFirst({
    where: { userId, itemId, itemType }
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Item already exists in favorite' },
      { status: 409 }
    );
  }

  const favorite = await prisma.$transaction(async (tx) => {
    const newFavorite = await tx.favorite.create({
      data: { userId, itemId, itemType }
    });
    let item = null;

    try {
      switch (newFavorite.itemType) {
        case ItemType.VIDEO:
          item = await prisma.video.findUnique({
            where: { videoId: newFavorite.itemId },
            select: {
              id: true,
              title: true,
              price: true,
              description: true,
              category: true
            }
          });
          break;
        case ItemType.DOCUMENT:
          item = await prisma.document.findUnique({
            where: { documentId: newFavorite.itemId },
            select: {
              id: true,
              title: true,
              price: true,
              description: true,
              category: true
            }
          });
          break;
        case ItemType.WORKSHOP:
          item = await prisma.workshop.findUnique({
            where: { id: newFavorite.itemId },
            select: {
              id: true,
              title: true,
              price: true,
              description: true,
              startDate: true
            }
          });
          break;
        case ItemType.COURSE:
          item = await prisma.course.findUnique({
            where: { id: newFavorite.itemId },
            select: {
              id: true,
              title: true,
              price: true,
              description: true,
              category: true
            }
          });
          break;
      }
    } catch (err) {
      return NextResponse.json(
        { error: `Failed to get item details: ${err}` },
        { status: 500 }
      );
    }
    return { ...newFavorite, ...item };
  });

  return NextResponse.json(favorite);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId');
  const itemId = searchParams.get('itemId');

  if (!userId || !itemId)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: {
      userId,
      itemId
    }
  });

  return NextResponse.json({ success: true });
}
