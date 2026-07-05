import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const prismaMock = {
  course: {
    findMany: vi.fn()
  },
  favorite: {
    groupBy: vi.fn()
  },
  orderItem: {
    groupBy: vi.fn()
  },
  user: {
    findUnique: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

const { auth } = await import('@clerk/nextjs/server');
const { GET } = await import('./route');

function courseFixture(overrides = {}) {
  return {
    id: 'course-123',
    title: 'Public Course',
    visualTitle2: 'Public Course Hero',
    description: 'Course description',
    price: '49.99',
    isPublic: true,
    thumbnailUrl: '/course.jpg',
    category: 'INTERVIEW',
    orderKey: 'a0',
    ...overrides
  };
}

describe('GET /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    prismaMock.course.findMany.mockResolvedValue([courseFixture()]);
    prismaMock.favorite.groupBy.mockResolvedValue([]);
    prismaMock.orderItem.groupBy.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(null);
  });

  it('returns only public courses by default', async () => {
    const response = await GET(new Request('http://localhost/api/courses'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.course.findMany).toHaveBeenCalledWith({
      where: { isPublic: true },
      orderBy: { orderKey: 'asc' }
    });
    expect(data).toEqual([
      expect.objectContaining({
        id: 'course-123',
        title: 'Public Course',
        status: '공개중'
      })
    ]);
  });

  it('requires authentication for admin-scoped course lists', async () => {
    const response = await GET(
      new Request('http://localhost/api/courses?scope=admin')
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(prismaMock.course.findMany).not.toHaveBeenCalled();
  });

  it('rejects non-admin users from admin-scoped course lists', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'USER' });

    const response = await GET(
      new Request('http://localhost/api/courses?scope=admin')
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
    expect(prismaMock.course.findMany).not.toHaveBeenCalled();
  });

  it('allows admins to retrieve public and private courses', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });
    prismaMock.course.findMany.mockResolvedValue([
      courseFixture(),
      courseFixture({
        id: 'course-private',
        title: 'Private Course',
        isPublic: false
      })
    ]);

    const response = await GET(
      new Request('http://localhost/api/courses?scope=admin')
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.course.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { orderKey: 'asc' }
    });
    expect(data).toEqual([
      expect.objectContaining({
        id: 'course-123',
        status: '공개중'
      }),
      expect.objectContaining({
        id: 'course-private',
        status: '비공개'
      })
    ]);
  });
});
