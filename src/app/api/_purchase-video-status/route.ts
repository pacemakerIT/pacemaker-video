import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ItemType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user by clerk ID
    const currentUser = await prisma.user.findFirst({
      where: {
        clerkId: clerkId
      },
      select: {
        id: true
      }
    });

    if (!currentUser?.id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Find all OrderItems of type VIDEO that belong to completed orders for this user
    const videoOrderItems = await prisma.orderItem.findMany({
      where: {
        itemType: ItemType.VIDEO,
        order: {
          userId: currentUser.id,
          status: 'COMPLETED'
        }
      },
      select: {
        itemId: true
      }
    });

    // 3. Extract all itemIds (video IDs)
    const videoIds = videoOrderItems.map((item) => item.itemId);

    if (videoIds.length === 0) {
      return NextResponse.json({ purchasedVideoIds: [] }, { status: 200 });
    }

    // 4. Fetch actual videos
    const purchasedVideos = await prisma.video.findMany({
      where: {
        id: { in: videoIds }
      },
      select: {
        videoId: true // assuming you still want the actual videoId, not the DB id
      }
    });

    const purchasedVideoIds = purchasedVideos
      .map((video) => video.videoId)
      .filter(Boolean); // remove null/undefined if any

    return NextResponse.json({ purchasedVideoIds }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch purchased videos: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch purchased videos' },
      { status: 500 }
    );
  }
}
