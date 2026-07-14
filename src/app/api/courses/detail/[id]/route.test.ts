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
});
