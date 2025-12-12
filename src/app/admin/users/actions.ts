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
        },
        workshopRegistrations: true
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

    user.orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.itemType === 'VIDEO' || item.itemType === 'COURSE') {
          lectures++;
        } else if (item.itemType === 'DOCUMENT' || item.itemType === 'EBOOK') {
          ebooks++;
        }
      });
    });

    const workshops = user.workshopRegistrations.length;

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
