import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // Validate video ID format
    if (!/^[a-zA-Z0-9]+$/.test(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    const video = await prisma.video.findUnique({
      where: { videoId: videoId }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch video details: ${error}` },
      { status: 500 }
    );
  }
}
