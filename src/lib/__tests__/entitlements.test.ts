import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType, OrderStatus } from '@prisma/client';

const client = {
  user: {
    findUnique: vi.fn()
  },
  orderItem: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  },
  course: {},
  ebook: {},
  video: {}
};

const {
  findUserIdByClerkId,
  getAccessibleCourseVideoIds,
  hasCompletedPurchase,
  isFreePrice,
  userCanAccessCourse,
  userCanAccessEbook,
  userCanAccessVideo
} = await import('../entitlements');

describe('entitlement helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('treats empty, missing, and zero prices as free', () => {
    expect(isFreePrice(null)).toBe(true);
    expect(isFreePrice('')).toBe(true);
    expect(isFreePrice('0')).toBe(true);
    expect(isFreePrice(0)).toBe(true);
    expect(isFreePrice('문의')).toBe(false);
    expect(isFreePrice(Number.NaN)).toBe(false);
    expect(isFreePrice('49.99')).toBe(false);
  });

  it('resolves app user ids from Clerk ids', async () => {
    client.user.findUnique.mockResolvedValue({ id: 'user-123' });

    await expect(
      findUserIdByClerkId(client as never, 'clerk_user_123')
    ).resolves.toBe('user-123');
  });

  it('checks completed purchases by item type and id', async () => {
    client.orderItem.findFirst.mockResolvedValue({ id: 'order-item-123' });

    await expect(
      hasCompletedPurchase(
        client as never,
        'user-123',
        ItemType.EBOOK,
        'ebook-123'
      )
    ).resolves.toBe(true);
    expect(client.orderItem.findFirst).toHaveBeenCalledWith({
      where: {
        itemId: 'ebook-123',
        itemType: ItemType.EBOOK,
        order: {
          userId: 'user-123',
          status: OrderStatus.COMPLETED
        }
      },
      select: { id: true }
    });
  });

  it('allows paid course access only when a course purchase exists', async () => {
    client.orderItem.findFirst.mockResolvedValue({ id: 'order-item-123' });

    await expect(
      userCanAccessCourse(client as never, 'user-123', {
        id: 'course-123',
        price: '49.99'
      })
    ).resolves.toBe(true);
    expect(client.orderItem.findFirst).toHaveBeenCalledWith({
      where: {
        itemId: 'course-123',
        itemType: ItemType.COURSE,
        order: {
          userId: 'user-123',
          status: OrderStatus.COMPLETED
        }
      },
      select: { id: true }
    });
  });

  it('returns only individually purchased videos when the full course is not purchased', async () => {
    client.orderItem.findFirst.mockResolvedValue(null);
    client.orderItem.findMany.mockResolvedValue([{ itemId: 'video-123' }]);

    const accessibleVideoIds = await getAccessibleCourseVideoIds(
      client as never,
      'user-123',
      { id: 'course-123', price: '49.99' },
      ['video-123', 'video-456']
    );

    expect([...accessibleVideoIds]).toEqual(['video-123']);
    expect(client.orderItem.findMany).toHaveBeenCalledWith({
      where: {
        itemId: { in: ['video-123', 'video-456'] },
        itemType: ItemType.VIDEO,
        order: {
          userId: 'user-123',
          status: OrderStatus.COMPLETED
        }
      },
      select: { itemId: true }
    });
  });

  it('blocks paid ebook access without a completed purchase', async () => {
    client.orderItem.findFirst.mockResolvedValue(null);

    await expect(
      userCanAccessEbook(client as never, 'user-123', {
        id: 'ebook-123',
        price: 25
      })
    ).resolves.toBe(false);
  });

  it('allows paid video access when the parent course was purchased', async () => {
    client.orderItem.findFirst.mockResolvedValue({ id: 'order-item-123' });

    await expect(
      userCanAccessVideo(client as never, 'user-123', {
        id: 'video-123',
        price: null,
        courseId: 'course-123',
        course: {
          id: 'course-123',
          price: '49.99'
        }
      })
    ).resolves.toBe(true);
    expect(client.orderItem.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            itemId: 'video-123',
            itemType: ItemType.VIDEO
          },
          {
            itemId: 'course-123',
            itemType: ItemType.COURSE
          }
        ],
        order: {
          userId: 'user-123',
          status: OrderStatus.COMPLETED
        }
      },
      select: { id: true }
    });
  });
});
