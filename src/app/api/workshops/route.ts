import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { WorkshopStatus, WorkshopCategory } from '@prisma/client';

const RECRUIT_STATUS_MAP: Record<string, WorkshopStatus> = {
  모집중: WorkshopStatus.RECRUITING,
  모집완료: WorkshopStatus.CLOSED,
  진행중: WorkshopStatus.ONGOING,
  진행완료: WorkshopStatus.COMPLETED
};

type WorkshopWithStatusDates = {
  startDate: Date | string;
  endDate: Date | string;
  status: WorkshopStatus | string;
};

function getEffectiveWorkshopStatus<T extends WorkshopWithStatusDates>(
  workshop: T,
  now = new Date()
) {
  if (workshop.status === WorkshopStatus.HIDDEN) {
    return WorkshopStatus.HIDDEN;
  }

  const startDate = new Date(workshop.startDate);
  const endDate = new Date(workshop.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return workshop.status;
  }

  if (endDate < now) {
    return WorkshopStatus.COMPLETED;
  }

  if (startDate <= now && now <= endDate) {
    return WorkshopStatus.ONGOING;
  }

  if (workshop.status === WorkshopStatus.CLOSED) {
    return WorkshopStatus.CLOSED;
  }

  return WorkshopStatus.RECRUITING;
}

function withEffectiveWorkshopStatus<T extends WorkshopWithStatusDates>(
  workshop: T
) {
  return {
    ...workshop,
    status: getEffectiveWorkshopStatus(workshop)
  };
}

interface InstructorInput {
  name: string;
  intro: string;
  photoUrl: string;
  careers?: {
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }[];
}

interface SectionInput {
  title: string;
  content: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get('id');
  const year = Number(searchParams.get('year'));
  const month = Number(searchParams.get('month'));
  const range = searchParams.get('range'); // '6months' 파라미터용
  const center = searchParams.get('center'); // optional center date

  try {
    // 1. 단건 조회
    if (id) {
      const workshop = await prisma.workshop.findFirst({
        where: {
          id,
          status: { not: WorkshopStatus.HIDDEN }
        },
        include: {
          instructors: {
            include: { instructor: { select: { name: true } } }
          }
        }
      });
      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(withEffectiveWorkshopStatus(workshop));
    }

    // 2. 6개월 조회 (center 기준 앞뒤 3개월)
    if (range === '6months') {
      const centerDate = center ? new Date(center) : new Date();
      if (isNaN(centerDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid center date' },
          { status: 400 }
        );
      }

      const startDate = new Date(
        centerDate.getFullYear(),
        centerDate.getMonth() - 3,
        1
      );
      const endDate = new Date(
        centerDate.getFullYear(),
        centerDate.getMonth() + 4,
        0,
        23,
        59,
        59
      );

      const workshops = await prisma.workshop.findMany({
        where: {
          status: { not: WorkshopStatus.HIDDEN },
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          price: true,
          locationOrUrl: true,
          status: true,
          category: true,
          thumbnail: true,
          instructors: {
            include: { instructor: { select: { name: true } } }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });

      return NextResponse.json({
        workshops: workshops.map(withEffectiveWorkshopStatus),
        count: workshops.length
      });
    }

    // 3. 월별 조회
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const workshops = await prisma.workshop.findMany({
        where: {
          status: { not: WorkshopStatus.HIDDEN },
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          price: true,
          locationOrUrl: true,
          status: true,
          category: true,
          thumbnail: true,
          instructors: {
            include: { instructor: { select: { name: true } } }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });

      return NextResponse.json({
        workshops: workshops.map(withEffectiveWorkshopStatus),
        count: workshops.length
      });
    }

    // 4. 전체 조회 (fallback)
    const workshops = await prisma.workshop.findMany({
      where: {
        status: { not: WorkshopStatus.HIDDEN }
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        price: true,
        locationOrUrl: true,
        status: true,
        category: true,
        thumbnail: true,
        instructors: {
          include: { instructor: { select: { name: true } } }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json({
      workshops: workshops.map(withEffectiveWorkshopStatus),
      count: workshops.length
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[API ERROR] /api/workshops:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      category,
      recruitStatus,
      showOnMain,
      title,
      description,
      startDate,
      endDate,
      location,
      processContent,
      price,
      thumbnailUrl,
      sections,
      instructors
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const newWorkshop = await prisma.$transaction(async (tx) => {
      const workshop = await tx.workshop.create({
        data: {
          category: (category as WorkshopCategory) || null,
          status:
            RECRUIT_STATUS_MAP[recruitStatus] ?? WorkshopStatus.RECRUITING,
          isMain: showOnMain ?? false,
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          locationOrUrl: location || null,
          processContent: processContent || null,
          price: price != null ? parseFloat(price) : null,
          thumbnail: thumbnailUrl || null,
          instructors: {
            create: (instructors || []).map((inst: InstructorInput) => ({
              instructor: {
                create: {
                  name: inst.name,
                  description: inst.intro,
                  profileImage: inst.photoUrl || null,
                  careers: inst.careers || []
                }
              }
            }))
          }
        }
      });

      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const s: SectionInput = sections[i];
          await tx.section.create({
            data: {
              title: s.title,
              description: s.content,
              orderIndex: i,
              workshopId: workshop.id
            }
          });
        }
      }

      return workshop;
    });

    return NextResponse.json(
      { message: 'Workshop created successfully', workshop: newWorkshop },
      { status: 201 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[API ERROR] POST /api/workshops:`, error);
    return NextResponse.json(
      { error: `Failed to create workshop: ${error}` },
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

    const { count } = await prisma.workshop.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      message: `${count} workshops deleted successfully`
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[API ERROR] DELETE /api/workshops:`, error);
    return NextResponse.json(
      { error: `Failed to delete workshops: ${error}` },
      { status: 500 }
    );
  }
}
