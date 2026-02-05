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

    // 관련 강의 가져오기 (같은 카테고리 우선, 현재 강의 제외)
    let relatedCoursesData = await prisma.course.findMany({
      where: {
        id: { not: id },
        category: courseData.category
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    // 만약 같은 카테고리의 강의가 부족하면, 카테고리 상관없이 부족한 만큼 추가로 가져옴
    if (relatedCoursesData.length < 3) {
      const moreCourses = await prisma.course.findMany({
        where: {
          // 이미 가져온 강의들과 현재 강의를 제외해야 함
          id: { notIn: [id, ...relatedCoursesData.map((c) => c.id)] }
        },
        take: 3 - relatedCoursesData.length,
        orderBy: { createdAt: 'desc' }
      });
      relatedCoursesData = [...relatedCoursesData, ...moreCourses];
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
      }),
      relatedCourses: relatedCoursesData.map((relatedCourse) => ({
        id: relatedCourse.id,
        itemId: relatedCourse.id, // itemId seems redundant but kept for type signature matching if needed
        title: relatedCourse.title,
        price: Number(relatedCourse.price) || 0, // Ensure number
        category: relatedCourse.category || 'GENERAL',
        type: 'course',
        thumbnail: relatedCourse.backgroundImage
      }))
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
