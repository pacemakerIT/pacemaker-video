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

  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, itemId, itemType } = body;

  if (!userId || !itemId || !itemType)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const favorite = await prisma.favorite.create({
    data: { userId, itemId, itemType }
  });

  return NextResponse.json(favorite);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId');
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType');

  if (!userId || !itemId || !itemType)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  await prisma.favorite.delete({
    where: {
      userId_itemType_itemId: {
        userId,
        itemType: ItemType.WORKSHOP,
        itemId
      }
    }
  });

  return NextResponse.json({ success: true });
}
