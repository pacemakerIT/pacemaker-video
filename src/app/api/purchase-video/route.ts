import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { clerkId, videoId, price } = await req.json();

    if (!clerkId || !videoId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findFirst({
      where: {
        clerkId: clerkId
      },
      select: {
        id: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentVideo = await prisma.video.findFirst({
      where: {
        videoId: videoId
      },
      select: {
        id: true
      }
    });

    if (!currentVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const existingPurchase = await prisma.purchasedVideo.findUnique({
      where: {
        userId_videoId: { userId: currentUser.id, videoId: currentVideo.id }
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Video already purchased' },
        { status: 409 }
      );
    }

    const purchase = await prisma.purchasedVideo.create({
      data: {
        userId: currentUser.id,
        videoId: currentVideo.id,
        price
      },
      select: {
        id: true,
        video: {
          select: {
            videoId: true
          }
        }
      }
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    // Handle known error cases
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Video already purchased' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: `Purchase failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
