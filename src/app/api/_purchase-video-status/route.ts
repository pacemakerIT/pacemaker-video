import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // Get all purchased videos for this user with their actual video IDs
    const purchasedVideos = await prisma.video.findMany({
      distinct: ['id'],
      // orderItems 테이블 컬럼 변경으로 최신화 필요
      /* where: {
        orderItems: {
          some: {
            order: {
              userId: currentUser.id,
              status: 'COMPLETED'
            }
          }
        }
      }, */
      select: {
        videoId: true
      }
    });

    // Extract actual video IDs from the video table, filtering out any null videos
    const purchasedVideoIds = purchasedVideos.map(
      (video: { videoId: string }) => video.videoId
    );

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
