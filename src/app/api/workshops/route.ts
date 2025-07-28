import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { toast } from 'sonner';

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
        include: { instructor: true }
      });

      if (!workshop) {
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(workshop);
    }

    // 2. 현재 기준 or center 기준 앞뒤 3개월 (총 6개월) 조회
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
        include: { instructor: true }
      });

      const count = workshops.length;

      return NextResponse.json({
        workshops,
        count
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
        include: { instructor: true }
      });

      const count = workshops.length;

      return NextResponse.json({
        workshops,
        count
      });
    }

    // 4. 전체 조회 (fallback)
    const workshops = await prisma.workshop.findMany({
      include: { instructor: true }
    });

    return NextResponse.json(workshops);
  } catch (error) {
    toast(`[API ERROR] /api/workshops: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
