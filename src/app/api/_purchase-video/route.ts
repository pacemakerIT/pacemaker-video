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

    const [currentUser, currentVideo] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId } }),
      prisma.video.findUnique({ where: { videoId } })
    ]);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!currentVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if the user has already purchased this video
    // We assume that a video can only be purchased once per user
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: currentUser.id,
        status: 'COMPLETED',
        items: {
          some: {
            itemId: currentVideo.id
          }
        }
      }
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: 'This is already purchased video' },
        { status: 409 } // Conflict
      );
    }

    // orderItems 테이블 컬럼 변경으로 최신화 필요
    /*
    const newOrder = await prisma.order.create({
      data: {
        userId: currentUser.id,
        totalAmount: price,
        status: 'COMPLETED'
        items: {
          create: [
            {
              videoId: currentVideo.id,
              priceAtPurchase: price,
              quantity: 1
            }
          ]
        }
      },
      include: {
        items: {
          select: {
            id: true
            video: {
              select: {
                videoId: true
              }
            } 
          }
        }
      }
    });*/

    // orderItems 테이블 컬럼 변경으로 최신화 필요
    /* 
    const createdItem = newOrder.items[0];

    if (!createdItem || !createdItem.video) {
      throw new Error('Failed to create purchase item or video not found');
    }

    const responseData = {
      id: createdItem.id,
      video: {
        videoId: createdItem.video.videoId
      }
    };

    return NextResponse.json(responseData, { status: 201 });
    */
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
