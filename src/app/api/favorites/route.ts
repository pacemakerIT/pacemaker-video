import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ItemType } from '@prisma/client';
import { requireCurrentUserId } from '@/lib/current-user';
import { apiErrorResponse, isItemType } from '@/lib/api-request';

export async function GET() {
  try {
    const userId = await requireCurrentUserId();

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
            case ItemType.EBOOK:
              item = await prisma.ebook.findFirst({
                where: {
                  isPublic: true,
                  OR: [{ ebookId: favorite.itemId }, { id: favorite.itemId }]
                },
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
              item = await prisma.course.findFirst({
                where: { id: favorite.itemId, isPublic: true },
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
          throw new Error('Item lookup failed', { cause: error });
        }
        return { ...favorite, ...item };
      })
    );
    return NextResponse.json(detailedFavorites);
  } catch (err) {
    return apiErrorResponse(err, 'Failed to fetch favorites');
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireCurrentUserId();
    const { itemId, itemType } = await req.json().catch(() => ({}));

    if (typeof itemId !== 'string' || !itemId.trim() || !isItemType(itemType))
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const favorite = await prisma.$transaction(async (tx) => {
      const newFavorite = await tx.favorite.upsert({
        where: {
          userId_itemType_itemId: {
            userId,
            itemType,
            itemId
          }
        },
        update: {},
        create: { userId, itemId, itemType }
      });
      let item = null;

      try {
        switch (newFavorite.itemType) {
          case ItemType.VIDEO:
            item = await tx.video.findUnique({
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
          case ItemType.EBOOK:
            item = await tx.ebook.findFirst({
              where: {
                isPublic: true,
                OR: [
                  { ebookId: newFavorite.itemId },
                  { id: newFavorite.itemId }
                ]
              },
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
            item = await tx.workshop.findUnique({
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
            item = await tx.course.findFirst({
              where: { id: newFavorite.itemId, isPublic: true },
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
        throw new Error('Failed to get item details', { cause: err });
      }
      return { ...newFavorite, ...item };
    });

    return NextResponse.json(favorite);
  } catch (err) {
    return apiErrorResponse(err, 'Failed to add favorite');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireCurrentUserId();
    const { searchParams } = req.nextUrl;
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType') as ItemType | null;

    if (!itemId || !isItemType(itemType))
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    await prisma.favorite.deleteMany({
      where: {
        userId,
        itemId,
        itemType
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiErrorResponse(err, 'Failed to remove favorite');
  }
}
