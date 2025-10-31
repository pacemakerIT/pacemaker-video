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
    const { videoId, title, description, price, courseId } = await req.json();

    if (!courseId || String(courseId).trim() === '') {
      return NextResponse.json(
        { error: 'courseId is required to create a Video' },
        { status: 400 }
      );
    }

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
      data: {
        videoId,
        title,
        description,
        price,
        course: { connect: { id: courseId } }
      }
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create video: ${error}` },
      { status: 500 }
    );
  }
}
