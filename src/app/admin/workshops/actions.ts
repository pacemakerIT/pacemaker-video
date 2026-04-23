'use server';

import prisma from '@/lib/prisma';

export interface WorkshopRow {
  id: string;
  title: string;
  description: string;
  price: number;
  likes: number;
  purchases: number;
  status: 'RECRUITING' | 'CLOSED' | 'ONGOING' | 'COMPLETED' | 'HIDDEN';
  category: string;
  thumbnail: string | null;
  selected: boolean;
  startDate: string;
  endDate: string;
  locationOrUrl: string | null;
}

export async function getWorkshops(): Promise<WorkshopRow[]> {
  const workshops = await prisma.workshop.findMany({
    include: {
      userWorkshops: true,
      _count: {
        select: {
          userWorkshops: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Fetch favorites count for each workshop
  const workshopsWithData = await Promise.all(
    workshops.map(async (workshop) => {
      const favoritesCount = await prisma.favorite.count({
        where: {
          itemId: workshop.id,
          itemType: 'WORKSHOP'
        }
      });

      return {
        id: workshop.id,
        title: workshop.title,
        description: workshop.description || '',
        price: workshop.price || 0,
        likes: favoritesCount,
        purchases: workshop._count.userWorkshops,
        status: workshop.status,
        category: (workshop.category ?? '') as string,
        thumbnail: workshop.thumbnail,
        selected: false,
        startDate: workshop.startDate
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.'),
        endDate: workshop.endDate
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.'),
        locationOrUrl: workshop.locationOrUrl
      };
    })
  );

  return workshopsWithData;
}
