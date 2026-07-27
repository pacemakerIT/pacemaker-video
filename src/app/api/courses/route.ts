import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  CourseCategory,
  ItemType,
  Prisma,
  TargetAudienceType
} from '@prisma/client';
import { generateKeyBetween } from 'fractional-indexing';
import { requireAdminUser } from '@/lib/admin-auth';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminScope = searchParams.get('scope') === 'admin';

    if (isAdminScope) {
      const adminAccess = await requireAdminUser();

      if (!adminAccess.ok) {
        return NextResponse.json(
          { error: adminAccess.error },
          { status: adminAccess.status }
        );
      }
    }

    const courses = await prisma.course.findMany({
      where: isAdminScope ? undefined : { isPublic: true },
      orderBy: {
        orderKey: 'asc'
      }
    });

    const courseIds = courses.map((c) => c.id);

    // Fetch likes (Favorites) count
    const favoritesGroups = await prisma.favorite.groupBy({
      by: ['itemId'],
      where: {
        itemType: ItemType.COURSE,
        itemId: { in: courseIds }
      },
      _count: {
        itemId: true
      }
    });

    // Fetch purchases (OrderItems) count
    const purchasesGroups = await prisma.orderItem.groupBy({
      by: ['itemId'],
      where: {
        itemType: ItemType.COURSE,
        itemId: { in: courseIds }
      },
      _sum: {
        quantity: true
      }
    });

    // Fetch average review rating per course
    const ratingGroups = await prisma.review.groupBy({
      by: ['courseId'],
      where: {
        courseId: { in: courseIds }
      },
      _avg: {
        rating: true
      }
    });

    // Create Maps for O(1) lookup
    const favoritesMap = new Map<string, number>();
    favoritesGroups.forEach((group) => {
      favoritesMap.set(group.itemId, group._count.itemId);
    });

    const purchasesMap = new Map<string, number>();
    purchasesGroups.forEach((group) => {
      purchasesMap.set(group.itemId, group._sum.quantity || 0);
    });

    const ratingMap = new Map<string, number>();
    ratingGroups.forEach((group) => {
      ratingMap.set(group.courseId, group._avg.rating || 0);
    });

    const rows = courses.map((course) => ({
      id: course.id,
      title: course.title || '',
      visualTitle2: course.visualTitle2,
      description: course.description || '',
      price: course.price ? `$${course.price}` : 'Free',
      likes: favoritesMap.get(course.id) || 0,
      purchases: purchasesMap.get(course.id) || 0,
      status: course.isPublic ? '공개중' : '비공개',
      thumbnail: course.thumbnailUrl || '',
      selected: false,
      summary: course.description || '',
      category: course.category || 'NETWORKING',
      orderKey: course.orderKey,
      uploadDate: course.createdAt,
      rating: ratingMap.get(course.id) || 0
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch courses: ${error}` },
      { status: 500 }
    );
  }
}

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

export async function POST(request: Request) {
  try {
    const adminAccess = await requireAdminUser();

    if (!adminAccess.ok) {
      return NextResponse.json(
        { error: adminAccess.error },
        { status: adminAccess.status }
      );
    }

    let body: CourseMutationBody;
    try {
      const parsedBody: unknown = await request.json();
      if (!isObject(parsedBody)) {
        return NextResponse.json(
          { error: 'Invalid course data' },
          { status: 400 }
        );
      }
      body = parsedBody as CourseMutationBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid course data' },
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
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Map Korean labels to Enum
    const targetAudienceTypes = (recommended || [])
      .map((label: string) => TARGET_AUDIENCE_MAP[label])
      .filter((value): value is TargetAudienceType => Boolean(value));

    const last = await prisma.course.findFirst({
      orderBy: { orderKey: 'desc' },
      select: { orderKey: true }
    });
    const nextKey = generateKeyBetween(last?.orderKey ?? null, null);

    // Perform creation in a transaction to ensure atomic execution and fix nested validation errors
    const newCourse = await prisma.$transaction(async (tx) => {
      // 1. Create the Course basic data and instructors
      const course = await tx.course.create({
        data: {
          category: category || CourseCategory.NETWORKING,
          orderKey: nextKey,
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
          // Instructors (Many-to-Many)
          instructors: {
            create: (instructors || []).map((inst: InstructorInput) => ({
              name: inst.name,
              description: inst.intro,
              profileImage: inst.photoUrl,
              careers: inst.careers || []
            }))
          }
        }
      });

      // 2. Create Sections and Videos iteratively
      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const sectionData = sections[i];
          const section = await tx.section.create({
            data: {
              title: sectionData.title,
              description: sectionData.content,
              orderIndex: i,
              courseId: course.id
            }
          });

          if (sectionData.videos && sectionData.videos.length > 0) {
            await tx.video.createMany({
              data: sectionData.videos.map((video: VideoInput) => ({
                title: video.title,
                videoId: video.link || `temp-${Math.random()}`,
                description: '',
                courseId: course.id,
                sectionId: section.id
              }))
            });
          }
        }
      }

      return course;
    });

    return NextResponse.json(
      { message: 'Course created successfully', course: newCourse },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create course: ${error}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const adminAccess = await requireAdminUser();

    if (!adminAccess.ok) {
      return NextResponse.json(
        { error: adminAccess.error },
        { status: adminAccess.status }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Updates must contain valid course statuses' },
        { status: 400 }
      );
    }
    const updates =
      body && typeof body === 'object' && !Array.isArray(body)
        ? (body as { updates?: unknown }).updates
        : undefined;

    if (
      !Array.isArray(updates) ||
      updates.length === 0 ||
      !updates.every(
        (update) =>
          isUuid(update?.id) &&
          (update.status === '공개중' || update.status === '비공개')
      )
    ) {
      return NextResponse.json(
        { error: 'Updates must contain valid course statuses' },
        { status: 400 }
      );
    }

    // Use a transaction to update multiple courses
    await prisma.$transaction(
      updates.map((update: { id: string; status: string }) =>
        prisma.course.update({
          where: { id: update.id },
          data: {
            isPublic: update.status === '공개중'
          }
        })
      )
    );

    return NextResponse.json({ message: 'Courses updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update courses: ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const adminAccess = await requireAdminUser();

    if (!adminAccess.ok) {
      return NextResponse.json(
        { error: adminAccess.error },
        { status: adminAccess.status }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'IDs must contain valid course UUIDs' },
        { status: 400 }
      );
    }
    const ids =
      body && typeof body === 'object' && !Array.isArray(body)
        ? (body as { ids?: unknown }).ids
        : undefined;

    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(isUuid)) {
      return NextResponse.json(
        { error: 'IDs must contain valid course UUIDs' },
        { status: 400 }
      );
    }

    const { count } = await prisma.course.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      message: `${count} courses deleted successfully`
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete courses: ${error}` },
      { status: 500 }
    );
  }
}
