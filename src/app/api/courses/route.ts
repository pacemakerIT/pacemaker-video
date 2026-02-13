import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ItemType } from '@prisma/client';

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
      title: course.title,
      description: course.description || '',
      price: course.price ? `$${course.price}` : 'Free',
      likes: favoritesMap.get(course.id) || 0,
      purchases: purchasesMap.get(course.id) || 0,
      status: course.isPublic ? '공개중' : '비공개',
      thumbnail: course.backgroundImage || '',
      selected: false,
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
