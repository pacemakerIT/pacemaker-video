import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { TARGET_AUDIENCE_MAPPING } from '@/constants/target-audience';
import { auth } from '@clerk/nextjs/server';
import { CourseCategory, Prisma, TargetAudienceType } from '@prisma/client';
import { requireAdminUser } from '@/lib/admin-auth';
import {
  findUserIdByClerkId,
  getAccessibleCourseVideoIds,
  isFreePrice,
  userCanAccessCourse
} from '@/lib/entitlements';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TARGET_AUDIENCE_REVERSE_MAP: Record<TargetAudienceType, string> = {
  [TargetAudienceType.IT]: 'IT 개발',
  [TargetAudienceType.GOVERNMENT]: '공무원',
  [TargetAudienceType.FINANCE]: '재무회계',
  [TargetAudienceType.DESIGN]: '디자인',
  [TargetAudienceType.RESUME]: '북미 취업이력서',
  [TargetAudienceType.INTERVIEW]: '인터뷰 준비',
  [TargetAudienceType.NETWORKING]: '네트워킹',
  [TargetAudienceType.SERVICE]: '서비스'
};

const TARGET_AUDIENCE_MAP: Record<string, TargetAudienceType> = {
  'IT 개발': TargetAudienceType.IT,
  공무원: TargetAudienceType.GOVERNMENT,
  재무회계: TargetAudienceType.FINANCE,
  디자인: TargetAudienceType.DESIGN,
  '북미 취업이력서': TargetAudienceType.RESUME,
  '인터뷰 준비': TargetAudienceType.INTERVIEW,
  네트워킹: TargetAudienceType.NETWORKING,
  서비스: TargetAudienceType.SERVICE
};

interface InstructorInput {
  name: string;
  intro: string;
  photoUrl: string;
  careers?: Prisma.InputJsonValue;
}

interface VideoInput {
  title: string;
  link: string;
}

interface CourseMutationBody {
  category?: CourseCategory;
  isPublic?: boolean;
  showOnMain?: boolean;
  title?: string;
  description?: string;
  processTitle?: string;
  processContent?: string;
  videoLink?: string;
  price?: string;
  time?: string;
  thumbnailUrl?: string;
  visualTitle?: string;
  visualTitle2?: string;
  recommended?: string[];
  sections?: {
    title: string;
    content?: string;
    videos?: VideoInput[];
  }[];
  instructors?: InstructorInput[];
  links?: Prisma.InputJsonValue;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface ResolvedCourse {
  id: string;
  itemId: string;
  title: string;
  price: number;
  category: string;
  type: 'course' | 'link';
  thumbnail: string | null;
  linkUrl: string;
}

function applyVideoEntitlement<T extends { id: string; videoId: string }>(
  video: T,
  accessibleVideoIds: Set<string>
) {
  const canAccessVideo = accessibleVideoIds.has(video.id);

  return {
    ...video,
    canAccessVideo,
    videoId: canAccessVideo ? video.videoId : ''
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isAdminScope = searchParams.get('scope') === 'admin';

    if (isAdminScope) {
      const adminAccess = await requireAdminUser();

      if (!adminAccess.ok) {
        return NextResponse.json(
          {
            success: false,
            error: adminAccess.error,
            message: '관리자 권한이 필요합니다.'
          },
          { status: adminAccess.status }
        );
      }
    }

    const { userId: clerkUserId } = await auth();

    const courseData = await prisma.course.findUnique({
      where: { id },
      include: {
        instructors: true,
        videos: true,
        sectionsRel: {
          include: {
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

    if (!courseData || (!isAdminScope && !courseData.isPublic)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
          message: '코스를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    const videoIds = [
      ...new Set([
        ...courseData.videos.map((video) => video.id),
        ...courseData.sectionsRel.flatMap((section) =>
          section.videos.map((video) => video.id)
        )
      ])
    ];
    const courseEntitlement = {
      id: courseData.id,
      price: courseData.price
    };
    const userId =
      !isAdminScope && clerkUserId
        ? await findUserIdByClerkId(prisma, clerkUserId)
        : null;
    let canAccessCourse: boolean;
    let accessibleVideoIds: Set<string>;

    if (isAdminScope) {
      canAccessCourse = true;
      accessibleVideoIds = new Set(videoIds);
    } else {
      [canAccessCourse, accessibleVideoIds] = await Promise.all([
        userCanAccessCourse(prisma, userId, courseEntitlement),
        getAccessibleCourseVideoIds(prisma, userId, courseEntitlement, videoIds)
      ]);
    }

    // 관련 강의 가져오기 (같은 카테고리 우선, 현재 강의 제외)
    let relatedCoursesData = await prisma.course.findMany({
      where: {
        id: { not: id },
        category: courseData.category,
        ...(isAdminScope ? {} : { isPublic: true })
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    // 만약 같은 카테고리의 강의가 부족하면, 카테고리 상관없이 부족한 만큼 추가로 가져옴
    if (relatedCoursesData.length < 3) {
      const moreCourses = await prisma.course.findMany({
        where: {
          // 이미 가져온 강의들과 현재 강의를 제외해야 함
          id: { notIn: [id, ...relatedCoursesData.map((c) => c.id)] },
          ...(isAdminScope ? {} : { isPublic: true })
        },
        take: 3 - relatedCoursesData.length,
        orderBy: { createdAt: 'desc' }
      });
      relatedCoursesData = [...relatedCoursesData, ...moreCourses];
    }

    // Parse recommendedLinks and fetch real course data for internal links
    const recommendedLinksJson = courseData.recommendedLinks as
      | {
          name: string;
          url: string;
        }[]
      | null;
    let resolvedRecommendedCourses: ResolvedCourse[] = [];

    if (recommendedLinksJson && recommendedLinksJson.length > 0) {
      const internalCourseIds = recommendedLinksJson
        .map((link) => {
          const match = link.url.match(/\/courses\/([a-z0-9-]+)/i);
          return match ? match[1] : null;
        })
        .filter((id): id is string => id !== null);

      if (internalCourseIds.length > 0) {
        const courses = await prisma.course.findMany({
          where: {
            id: { in: internalCourseIds },
            ...(isAdminScope ? {} : { isPublic: true })
          }
        });

        resolvedRecommendedCourses = recommendedLinksJson.map((link) => {
          const match = link.url.match(/\/courses\/([a-z0-9-]+)/i);
          if (match) {
            const resolved = courses.find((c) => c.id === match[1]);
            if (resolved) {
              return {
                id: resolved.id,
                itemId: resolved.id,
                title: resolved.visualTitle2 || resolved.title || link.name,
                price: Number(resolved.price) || 0,
                category: resolved.category || 'GENERAL',
                type: 'course',
                thumbnail: resolved.thumbnailUrl,
                linkUrl: link.url
              };
            }
          }
          return {
            id: link.name,
            itemId: link.name,
            title: link.name,
            price: 0,
            category: 'LINK',
            type: 'link',
            thumbnail: null,
            linkUrl: link.url
          };
        });
      }
    }

    const {
      videos: courseVideos,
      sectionsRel: courseSections,
      ...courseBase
    } = courseData;

    // DB 구조를 Frontend 구조로 변환
    const course = {
      ...courseBase,
      videos: courseVideos.map((video) =>
        applyVideoEntitlement(video, accessibleVideoIds)
      ),
      sections: (courseSections || []).map((section) => ({
        ...section,
        videos: (section.videos || []).map((video) =>
          applyVideoEntitlement(video, accessibleVideoIds)
        )
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
      // Add Korean labels for admin UI
      recommendedLabels: (courseData.targetAudienceTypes || []).map(
        (type) => TARGET_AUDIENCE_REVERSE_MAP[type as TargetAudienceType]
      ),
      relatedCourses: relatedCoursesData.map((relatedCourse) => ({
        id: relatedCourse.id,
        itemId: relatedCourse.id,
        title: relatedCourse.visualTitle2,
        price: Number(relatedCourse.price) || 0,
        category: relatedCourse.category || 'GENERAL',
        type: 'course',
        thumbnail: relatedCourse.thumbnailUrl
      })),
      resolvedRecommendedCourses,
      instructors: courseData.instructors || []
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          course,
          instructors: course.instructors,
          entitlements: {
            requiresPurchase: !isFreePrice(courseData.price),
            canAccessCourse
          }
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAccess = await requireAdminUser();

    if (!adminAccess.ok) {
      return NextResponse.json(
        {
          success: false,
          error: adminAccess.error,
          message: '관리자 권한이 필요합니다.'
        },
        { status: adminAccess.status }
      );
    }

    const { id } = await params;

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid course id',
          message: '유효하지 않은 강의 ID입니다.'
        },
        { status: 400 }
      );
    }

    let body: CourseMutationBody;
    try {
      const parsedBody: unknown = await request.json();
      if (!isObject(parsedBody)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid course data',
            message: '유효하지 않은 강의 데이터입니다.'
          },
          { status: 400 }
        );
      }
      body = parsedBody as CourseMutationBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid course data',
          message: '유효하지 않은 강의 데이터입니다.'
        },
        { status: 400 }
      );
    }
    const {
      category,
      isPublic,
      showOnMain,
      title,
      description,
      processTitle,
      processContent,
      videoLink,
      price,
      time,
      thumbnailUrl,
      visualTitle,
      visualTitle2,
      recommended, // TargetAudienceType strings (Korean)
      sections,
      instructors,
      links // RecommendedLinks JSON
    } = body;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title is required',
          message: '제목은 필수입니다.'
        },
        { status: 400 }
      );
    }

    // Map Korean labels to Enum
    const targetAudienceTypes = (recommended || [])
      .map((label: string) => TARGET_AUDIENCE_MAP[label])
      .filter((value): value is TargetAudienceType => Boolean(value));

    // Perform update in a transaction to ensure atomic execution
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // 1. Delete existing sections and videos (simplest way to sync)
      await tx.section.deleteMany({ where: { courseId: id } });
      await tx.video.deleteMany({ where: { courseId: id } });

      // 2. Update the Course basic data and instructors
      const course = await tx.course.update({
        where: { id },
        data: {
          category: category || CourseCategory.NETWORKING,
          isPublic,
          showOnMain,
          title,
          description,
          processTitle,
          processContent,
          videoLink,
          price,
          time,
          thumbnailUrl,
          visualTitle,
          visualTitle2,
          targetAudienceTypes,
          recommendedLinks: links || [],
          // Instructors (Replace existing ones)
          instructors: {
            set: [], // Disconnect existing M:N relations
            create: (instructors || []).map((inst: InstructorInput) => ({
              name: inst.name,
              description: inst.intro,
              profileImage: inst.photoUrl,
              careers: inst.careers || []
            }))
          }
        }
      });

      // 3. Create new Sections and Videos iteratively
      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const sectionData = sections[i];
          const section = await tx.section.create({
            data: {
              title: sectionData.title,
              description: sectionData.content,
              orderIndex: i,
              courseId: id
            }
          });

          if (sectionData.videos && sectionData.videos.length > 0) {
            await tx.video.createMany({
              data: sectionData.videos.map((video: VideoInput) => ({
                title: video.title,
                videoId: video.link || `temp-${Math.random()}`,
                description: '',
                courseId: id,
                sectionId: section.id
              }))
            });
          }
        }
      }

      return course;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Course updated successfully',
        data: { course: updatedCourse }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update course: ${error}`,
        message: '코스 수정에 실패했습니다.'
      },
      { status: 500 }
    );
  }
}
