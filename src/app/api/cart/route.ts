import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ItemType } from '@prisma/client';
import { requireCurrentUserId } from '@/lib/current-user';
import { apiErrorResponse, isItemType } from '@/lib/api-request';

export async function GET() {
  try {
    const userId = await requireCurrentUserId();

    const carts = await prisma.cart.findMany({
      where: { userId },
      select: { itemId: true, itemType: true }
    });

    const detailedCarts = await Promise.all(
      carts.map(async (cart) => {
        let item = null;

        try {
          switch (cart.itemType) {
            case ItemType.VIDEO:
              item = await prisma.video.findUnique({
                where: { videoId: cart.itemId },
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
                where: { id: cart.itemId, isPublic: true },
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
                where: { id: cart.itemId },
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
                where: { id: cart.itemId, isPublic: true },
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

        return { ...cart, ...item };
      })
    );

    return NextResponse.json(detailedCarts);
  } catch (err) {
    return apiErrorResponse(err, 'Failed to fetch cart');
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireCurrentUserId();
    const { itemId, itemType } = await req.json().catch(() => ({}));

    if (typeof itemId !== 'string' || !itemId.trim() || !isItemType(itemType))
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const existing = await prisma.cart.findFirst({
      where: { userId, itemId, itemType }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Item already exists in cart' },
        { status: 409 }
      );
    }

    const cart = await prisma.$transaction(async (tx) => {
      const newCart = await tx.cart.create({
        data: { userId, itemId, itemType }
      });
      let item = null;

      try {
        switch (newCart.itemType) {
          case ItemType.VIDEO:
            item = await prisma.video.findUnique({
              where: { videoId: newCart.itemId },
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
              where: { id: newCart.itemId, isPublic: true },
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
              where: { id: newCart.itemId },
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
              where: { id: newCart.itemId, isPublic: true },
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
      return { ...newCart, ...item };
    });

    return NextResponse.json(cart);
  } catch (err) {
    return apiErrorResponse(err, 'Failed to add item to cart');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireCurrentUserId();

    const body = await req.json().catch(() => ({}));

    const itemIds: string[] = Array.isArray(body.itemIds)
      ? body.itemIds
      : [body.itemIds];

    if (
      itemIds.length === 0 ||
      itemIds.some((itemId) => typeof itemId !== 'string' || !itemId)
    ) {
      return NextResponse.json(
        { error: 'No items to delete' },
        { status: 400 }
      );
    }

    await prisma.cart.deleteMany({
      where: {
        userId,
        itemId: { in: itemIds }
      }
    });

    return NextResponse.json({
      message: 'Items removed from cart',
      deletedIds: itemIds
    });
  } catch (err) {
    return apiErrorResponse(err, 'Failed to remove items from cart');
  }
}
