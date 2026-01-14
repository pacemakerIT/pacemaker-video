'use server';

import prisma from '@/lib/prisma';
import { UserRow, UserRole } from '@/types/admin/user';

export async function getUsers(
  page: number = 1,
  limit: number = 10,
  roleFilter: 'all' | UserRole = 'all'
): Promise<{ users: UserRow[]; total: number }> {
  const skip = (page - 1) * limit;

  // Build where clause based on role filter
  const whereClause = roleFilter !== 'all' ? { roleId: roleFilter } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        role: true,
        orders: {
          include: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count({
      where: whereClause
    })
  ]);

  const mappedUsers = users.map((user) => {
    // Calculate purchase counts
    let lectures = 0;
    let ebooks = 0;
    let workshops = 0;

    user.orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.itemType === 'VIDEO' || item.itemType === 'COURSE') {
          lectures++;
        } else if (item.itemType === 'DOCUMENT' || item.itemType === 'EBOOK') {
          ebooks++;
        } else if (item.itemType === 'WORKSHOP') {
          workshops++;
        }
      });
    });

    // Map role
    const role: UserRole = user.role.id as UserRole;

    // Format date YYYY.MM.DD
    const createdAt = user.createdAt
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '.');

    return {
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      image: user.image || '/img/default-profile.png',
      createdAt,
      role,
      selected: false,
      purchases: {
        lectures,
        ebooks,
        workshops
      }
    };
  });

  return { users: mappedUsers, total };
}

export interface OrderDetail {
  id: string;
  orderedAt: string;
  totalAmount: number;
  status: string;
  items: Array<{
    itemId: string;
    itemType: string;
    itemTitle: string;
  }>;
}

export async function getUserOrders(userId: string): Promise<OrderDetail[]> {
  const orders = await prisma.order.findMany({
    where: {
      userId: userId
    },
    include: {
      items: true
    },
    orderBy: {
      orderedAt: 'desc'
    }
  });

  // Fetch titles for all items
  const ordersWithTitles = await Promise.all(
    orders.map(async (order) => {
      const itemsWithTitles = await Promise.all(
        order.items.map(async (item) => {
          let itemTitle = 'Unknown Item';

          try {
            switch (item.itemType) {
              case 'VIDEO': {
                const video = await prisma.video.findUnique({
                  where: { id: item.itemId }
                });
                itemTitle = video?.title || 'Unknown Video';
                break;
              }
              case 'COURSE': {
                const course = await prisma.course.findUnique({
                  where: { id: item.itemId }
                });
                itemTitle = course?.title || 'Unknown Course';
                break;
              }
              case 'DOCUMENT':
              case 'EBOOK': {
                const document = await prisma.document.findUnique({
                  where: { id: item.itemId }
                });
                itemTitle = document?.title || 'Unknown Document';
                break;
              }
              case 'WORKSHOP': {
                const workshop = await prisma.workshop.findUnique({
                  where: { id: item.itemId }
                });
                itemTitle = workshop?.title || 'Unknown Workshop';
                break;
              }
            }
          } catch (error) {
            throw new Error(
              `Failed to fetch title for ${item.itemType} ${item.itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }

          return {
            itemId: item.itemId,
            itemType: item.itemType,
            itemTitle: itemTitle
          };
        })
      );

      return {
        id: order.id,
        orderedAt: order.orderedAt
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.'),
        totalAmount: order.totalAmount,
        status: order.status,
        items: itemsWithTitles
      };
    })
  );

  return ordersWithTitles;
}
