import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { TARGET_AUDIENCE_MAPPING } from '@/constants/target-audience';
import { TargetAudienceType } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const courseData = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        videos: true,
        sectionsRel: {
          include: {
            items: true,
            videos: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!courseData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
          message: '코스를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    // DB 구조를 Frontend 구조로 변환
    const course = {
      ...courseData,
      sections: (courseData.sectionsRel || []).map((section) => ({
        ...section,
        items: (section.items || []).map((item) => ({
          ...item,
          icon: item.icon || null
        }))
      })),
      targetAudiences: (courseData.targetAudienceTypes || []).map((type) => {
        const mapping = TARGET_AUDIENCE_MAPPING[type as TargetAudienceType];
        return {
          type,
          title: mapping?.title || type,
          content: mapping?.content || '',
          icon: mapping?.icon || null,
          label: mapping?.label || type
        };
      })
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          course,
          instructor: course.instructor
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch course: ${error}`,
        message: '코스 정보를 가져오는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}
