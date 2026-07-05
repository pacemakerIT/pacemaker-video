import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const prismaMock = {
  course: {
    findUnique: vi.fn(),
    findMany: vi.fn()
  },
  user: {
    findUnique: vi.fn()
  },
  orderItem: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

const { auth } = await import('@clerk/nextjs/server');
const { GET } = await import('./route');

function courseFixture() {
  return {
    id: 'course-123',
    title: 'Paid Course',
    description: 'Course description',
    processTitle: null,
    processContent: null,
    videoLink: null,
    price: '49.99',
    time: null,
    thumbnailUrl: null,
    visualTitle: null,
    visualTitle2: 'Paid Course Hero',
    category: 'INTERVIEW',
    isPublic: true,
    targetAudienceTypes: [],
    recommendedLinks: null,
    instructors: [],
    videos: [
      {
        id: 'video-db-1',
        videoId: 'wistia123',
        title: 'Private Wistia Video',
        description: null,
        price: null,
        thumbnail: null,
        category: null
      },
      {
        id: 'video-db-2',
        videoId: 'wistia456',
        title: 'Purchased Single Video',
        description: null,
        price: 25,
        thumbnail: null,
        category: null
      }
    ],
    sectionsRel: [
      {
        id: 'section-1',
        title: 'Section 1',
        description: null,
        orderIndex: 0,
        videos: [
          {
            id: 'video-db-1',
            videoId: 'wistia123',
            title: 'Private Wistia Video',
            description: null,
            price: null,
            thumbnail: null,
            category: null
          },
          {
            id: 'video-db-2',
            videoId: 'wistia456',
            title: 'Purchased Single Video',
            description: null,
            price: 25,
            thumbnail: null,
            category: null
          }
        ]
      }
    ],
    reviews: []
  };
}

function context() {
  return {
    params: Promise.resolve({ id: 'course-123' })
  };
}

describe('GET /api/courses/detail/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.course.findUnique.mockResolvedValue(courseFixture());
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123' });
    prismaMock.orderItem.findFirst.mockResolvedValue(null);
    prismaMock.orderItem.findMany.mockResolvedValue([]);
  });

  it('strips playable video ids for users without completed purchases', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);

    const response = await GET(new Request('http://localhost'), context());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.entitlements).toEqual({
      requiresPurchase: true,
      canAccessCourse: false
    });
    expect(data.data.course.videos[0].videoId).toBe('');
    expect(data.data.course.videos[0].canAccessVideo).toBe(false);
    expect(data.data.course.sections[0].videos[0].videoId).toBe('');
    expect(data.data.course.sections[0].videos[0].canAccessVideo).toBe(false);
    expect(data.data.course.sectionsRel).toBeUndefined();
    expect(JSON.stringify(data.data.course)).not.toContain('wistia123');
    expect(JSON.stringify(data.data.course)).not.toContain('wistia456');
  });

  it('keeps all playable video ids for completed course purchasers', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
    prismaMock.orderItem.findFirst.mockResolvedValue({
      id: 'order-item-123'
    });

    const response = await GET(new Request('http://localhost'), context());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.entitlements).toEqual({
      requiresPurchase: true,
      canAccessCourse: true
    });
    expect(data.data.course.videos[0].videoId).toBe('wistia123');
    expect(data.data.course.videos[0].canAccessVideo).toBe(true);
    expect(data.data.course.videos[1].videoId).toBe('wistia456');
    expect(data.data.course.videos[1].canAccessVideo).toBe(true);
    expect(data.data.course.sections[0].videos[0].videoId).toBe('wistia123');
    expect(data.data.course.sectionsRel).toBeUndefined();
  });

  it('keeps only individually purchased video ids when the course is not purchased', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
    prismaMock.orderItem.findFirst.mockResolvedValue(null);
    prismaMock.orderItem.findMany.mockResolvedValue([
      {
        itemId: 'video-db-2'
      }
    ]);

    const response = await GET(new Request('http://localhost'), context());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.entitlements).toEqual({
      requiresPurchase: true,
      canAccessCourse: false
    });
    expect(data.data.course.videos[0].videoId).toBe('');
    expect(data.data.course.videos[0].canAccessVideo).toBe(false);
    expect(data.data.course.videos[1].videoId).toBe('wistia456');
    expect(data.data.course.videos[1].canAccessVideo).toBe(true);
    expect(data.data.course.sections[0].videos[0].videoId).toBe('');
    expect(data.data.course.sections[0].videos[1].videoId).toBe('wistia456');
    expect(data.data.course.sectionsRel).toBeUndefined();
    expect(JSON.stringify(data.data.course)).not.toContain('wistia123');
  });

  it('keeps playable video ids for free courses without exposing raw sectionsRel', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    prismaMock.course.findUnique.mockResolvedValue({
      ...courseFixture(),
      price: '0'
    });

    const response = await GET(new Request('http://localhost'), context());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.entitlements).toEqual({
      requiresPurchase: false,
      canAccessCourse: true
    });
    expect(data.data.course.videos[0].videoId).toBe('wistia123');
    expect(data.data.course.sections[0].videos[0].videoId).toBe('wistia123');
    expect(data.data.course.sectionsRel).toBeUndefined();
  });

  it('hides private courses from public detail requests', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    prismaMock.course.findUnique.mockResolvedValue({
      ...courseFixture(),
      isPublic: false
    });

    const response = await GET(new Request('http://localhost'), context());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: 'Course not found',
      message: '코스를 찾을 수 없습니다.'
    });
    expect(prismaMock.course.findMany).not.toHaveBeenCalled();
    expect(prismaMock.orderItem.findFirst).not.toHaveBeenCalled();
  });

  it('allows admins to load private courses through admin scope', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-123',
      roleId: 'ADMIN'
    });
    prismaMock.course.findUnique.mockResolvedValue({
      ...courseFixture(),
      isPublic: false
    });

    const response = await GET(
      new Request('http://localhost?scope=admin'),
      context()
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.course.isPublic).toBe(false);
    expect(data.data.course.videos[0].videoId).toBe('wistia123');
    expect(data.data.course.entitlements).toBeUndefined();
    expect(data.data.entitlements).toEqual({
      requiresPurchase: true,
      canAccessCourse: true
    });
    expect(prismaMock.orderItem.findFirst).not.toHaveBeenCalled();
  });

  it('requires admin access for admin-scoped course detail requests', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'USER' });

    const response = await GET(
      new Request('http://localhost?scope=admin'),
      context()
    );
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({
      success: false,
      error: 'Forbidden',
      message: '관리자 권한이 필요합니다.'
    });
    expect(prismaMock.course.findUnique).not.toHaveBeenCalled();
  });

  it('only resolves public related and recommended courses for public detail requests', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    prismaMock.course.findUnique.mockResolvedValue({
      ...courseFixture(),
      recommendedLinks: [
        { name: 'Public recommendation', url: '/courses/course-public' },
        { name: 'Private recommendation', url: '/courses/course-private' }
      ]
    });

    await GET(new Request('http://localhost'), context());

    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'INTERVIEW',
          isPublic: true
        })
      })
    );
    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['course-public', 'course-private'] },
          isPublic: true
        })
      })
    );
  });
});
