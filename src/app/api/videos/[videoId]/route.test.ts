import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType, OrderStatus } from '@prisma/client';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const prismaMock = {
  video: {
    findUnique: vi.fn()
  },
  user: {
    findUnique: vi.fn()
  },
  orderItem: {
    findFirst: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

const { auth } = await import('@clerk/nextjs/server');
const { GET } = await import('./route');

function context(videoId = 'abc123') {
  return {
    params: Promise.resolve({ videoId })
  };
}

describe('GET /api/videos/[videoId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
    prismaMock.video.findUnique.mockResolvedValue({
      id: 'video-db-123',
      videoId: 'abc123',
      title: 'Paid Video',
      price: null,
      courseId: 'course-123',
      course: {
        id: 'course-123',
        price: '49.99'
      }
    });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123' });
    prismaMock.orderItem.findFirst.mockResolvedValue({
      id: 'order-item-123'
    });
  });

  it('returns paid video details for completed purchasers', async () => {
    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: 'video-db-123',
      videoId: 'abc123'
    });
    expect(prismaMock.orderItem.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            itemId: 'video-db-123',
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

  it('blocks paid videos for users without completed purchases', async () => {
    prismaMock.orderItem.findFirst.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Purchase required to view this video'
    });
  });

  it('allows free videos without authentication', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    prismaMock.video.findUnique.mockResolvedValue({
      id: 'video-db-123',
      videoId: 'abc123',
      title: 'Free Video',
      price: 0,
      courseId: null,
      course: null
    });

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(200);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.orderItem.findFirst).not.toHaveBeenCalled();
  });
});
