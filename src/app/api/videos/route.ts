import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Get all videos
export async function GET() {
  try {
    const videos = await prisma.video.findMany();
    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch videos: ${error}` },
      { status: 500 }
    );
  }
}

// Create new video
export async function POST(req: Request) {
  try {
    const { videoId, title, description, price } = await req.json();

    // Check if the video already exists
    const existingVideo = await prisma.video.findUnique({
      where: { videoId }
    });

    if (existingVideo) {
      return NextResponse.json(
        { error: 'This video is already registered.' },
        { status: 400 }
      );
    }

    const newVideo = await prisma.video.create({
      data: { videoId, title, description, price }
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create video: ${error}` },
      { status: 500 }
    );
  }
}
