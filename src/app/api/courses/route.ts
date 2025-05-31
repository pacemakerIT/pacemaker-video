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
