import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const prismaMock = {
  course: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn()
  },
  favorite: {
    groupBy: vi.fn()
  },
  orderItem: {
    groupBy: vi.fn()
  },
  user: {
    findUnique: vi.fn()
  },
  $transaction: vi.fn()
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

const { auth } = await import('@clerk/nextjs/server');
const { DELETE, GET, POST, PUT } = await import('./route');

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

describe('course mutation authorization and validation', () => {
  const courseId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockResolvedValue([]);
    prismaMock.course.update.mockResolvedValue({ id: courseId });
  });

  it.each(['POST', 'PUT', 'DELETE'] as const)(
    'rejects unauthenticated %s requests before parsing their body',
    async (method) => {
      const handler = { POST, PUT, DELETE }[method];
      const response = await handler(
        new Request('http://localhost/api/courses', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: '{'
        })
      );

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
      expect(prismaMock.course.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.course.update).not.toHaveBeenCalled();
      expect(prismaMock.course.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    }
  );

  it.each(['POST', 'PUT', 'DELETE'] as const)(
    'rejects non-admin %s requests before parsing their body',
    async (method) => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
      prismaMock.user.findUnique.mockResolvedValue({ roleId: 'USER' });
      const handler = { POST, PUT, DELETE }[method];
      const response = await handler(
        new Request('http://localhost/api/courses', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: '{'
        })
      );

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'Forbidden' });
      expect(prismaMock.course.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.course.update).not.toHaveBeenCalled();
      expect(prismaMock.course.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    }
  );

  it('rejects empty and invalid visibility update payloads', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });

    for (const updates of [
      [],
      [{ id: courseId, status: 'DRAFT' }],
      [{ id: 'not-a-uuid', status: '공개중' }]
    ]) {
      const response = await PUT(
        new Request('http://localhost/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        })
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Updates must contain valid course statuses'
      });
    }

    expect(prismaMock.course.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it.each([
    ['POST', POST, { error: 'Invalid course data' }],
    ['PUT', PUT, { error: 'Updates must contain valid course statuses' }],
    ['DELETE', DELETE, { error: 'IDs must contain valid course UUIDs' }]
  ] as const)(
    'returns 400 instead of 500 for malformed admin %s JSON',
    async (method, handler, expectedBody) => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'clerk_admin_123'
      } as never);
      prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });

      const response = await handler(
        new Request('http://localhost/api/courses', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: '{'
        })
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual(expectedBody);
      expect(prismaMock.course.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.course.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    }
  );

  it('updates valid visibility changes for an admin', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });

    const response = await PUT(
      new Request('http://localhost/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: courseId, status: '공개중' }]
        })
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.course.update).toHaveBeenCalledWith({
      where: { id: courseId },
      data: { isPublic: true }
    });
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
  });

  it('rejects invalid delete IDs without deleting any courses', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });

    const response = await DELETE(
      new Request('http://localhost/api/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ['not-a-uuid'] })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'IDs must contain valid course UUIDs'
    });
    expect(prismaMock.course.deleteMany).not.toHaveBeenCalled();
  });
});
