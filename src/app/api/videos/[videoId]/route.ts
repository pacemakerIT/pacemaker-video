import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { findUserIdByClerkId, userCanAccessVideo } from '@/lib/entitlements';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const { userId: clerkUserId } = await auth();

    // Validate video ID format
    if (!/^[a-zA-Z0-9]+$/.test(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    const video = await prisma.video.findUnique({
      where: { videoId: videoId },
      include: {
        course: {
          select: {
            id: true,
            price: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const userId = clerkUserId
      ? await findUserIdByClerkId(prisma, clerkUserId)
      : null;
    const canAccessVideo = await userCanAccessVideo(prisma, userId, video);

    if (!canAccessVideo) {
      return NextResponse.json(
        { error: 'Purchase required to view this video' },
        { status: 403 }
      );
    }

    return NextResponse.json(video, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch video details: ${error}` },
      { status: 500 }
    );
  }
}
