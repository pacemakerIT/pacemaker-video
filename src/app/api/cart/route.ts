import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ItemType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId)
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

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
            case ItemType.DOCUMENT:
              item = await prisma.document.findUnique({
                where: { documentId: cart.itemId },
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
              item = await prisma.course.findUnique({
                where: { id: cart.itemId },
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

        return { ...cart, ...item };
      })
    );

    return NextResponse.json(detailedCarts);
  } catch (err) {
    return NextResponse.json(
      { error: `GET /api/cart error: ${err}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, itemId, itemType } = body;

  if (!userId || !itemId || !itemType)
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
        case ItemType.DOCUMENT:
          item = await prisma.document.findUnique({
            where: { documentId: newCart.itemId },
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
          item = await prisma.course.findUnique({
            where: { id: newCart.itemId },
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
    return { ...newCart, ...item };
  });

  return NextResponse.json(cart);
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const body = await req.json();

    const itemIds: string[] = Array.isArray(body.itemIds)
      ? body.itemIds
      : [body.itemIds];

    if (itemIds.length === 0) {
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
    return NextResponse.json(
      { error: 'Failed to remove item(s) from cart:', err },
      { status: 500 }
    );
  }
}
