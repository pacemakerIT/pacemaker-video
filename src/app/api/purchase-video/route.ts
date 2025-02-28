import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, videoId, price } = await req.json();

    if (!userId || !videoId || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid fields' },
        { status: 400 }
      );
    }

    const existingPurchase = await prisma.purchasedVideo.findUnique({
      where: { userId_videoId: { userId, videoId } }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Video already purchased' },
        { status: 409 }
      );
    }

    const purchase = await prisma.purchasedVideo.create({
      data: { userId, videoId, price }
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
