import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ItemType, TargetAudienceType } from '@prisma/client';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: 'desc'
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

    // Create Maps for O(1) lookup
    const favoritesMap = new Map<string, number>();
    favoritesGroups.forEach((group) => {
      favoritesMap.set(group.itemId, group._count.itemId);
    });

    const purchasesMap = new Map<string, number>();
    purchasesGroups.forEach((group) => {
      purchasesMap.set(group.itemId, group._sum.quantity || 0);
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
      summary: course.description || '', // Keep mapping for UI compatibility if needed
      category: course.category || 'NETWORKING'
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
  careers?: string[];
}

interface VideoInput {
  title: string;
  link: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
      .filter(Boolean);

    // Perform creation in a transaction to ensure atomic execution and fix nested validation errors
    const newCourse = await prisma.$transaction(async (tx) => {
      // 1. Create the Course basic data and instructors
      const course = await tx.course.create({
        data: {
          category: category || 'NETWORKING',
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
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
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
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No IDs provided for deletion' },
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
