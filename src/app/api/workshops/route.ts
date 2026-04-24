import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
      const workshop = await prisma.workshop.findUnique({
        where: { id },
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
      return NextResponse.json(workshop);
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
        workshops,
        count: workshops.length
      });
    }

    // 3. 월별 조회
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const workshops = await prisma.workshop.findMany({
        where: {
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
        workshops,
        count: workshops.length
      });
    }

    // 4. 전체 조회 (fallback)
    const workshops = await prisma.workshop.findMany({
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
      workshops,
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
