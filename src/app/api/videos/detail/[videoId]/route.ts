import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // Video를 통해 Course를 조회 (videoId 필드로 조회)
    const video = await prisma.video.findUnique({
      where: { videoId: videoId }, // id 대신 videoId 사용
      include: {
        course: {
          include: {
            instructor: true
          }
        }
      }
    });

    if (!video || !video.course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video or Course not found',
          message: '비디오 또는 코스를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          course: video.course,
          instructor: video.course.instructor
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch video: ${error}`,
        message: '비디오 정보를 가져오는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}
