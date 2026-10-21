import { describe, expect, it, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({ ebook: { findMany: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const { GET } = await import('./route');

describe('GET /api/ebooks', () => {
  beforeEach(() => vi.resetAllMocks());

  it('only requests public ebooks and returns public listing fields', async () => {
    prismaMock.ebook.findMany.mockResolvedValue([
      {
        id: 'public-ebook',
        title: 'Public guide',
        description: 'Guide',
        category: 'CAREER',
        price: 10,
        thumbnail: '/guide.png',
        ebookId: 'private-storage-key.pdf',
        isPublic: true
      }
    ]);

    const response = await GET({
      nextUrl: new URL('http://localhost/api/ebooks?isMain=true')
    } as never);

    expect(prismaMock.ebook.findMany).toHaveBeenCalledWith({
      where: { isPublic: true, isMain: true },
      orderBy: { orderKey: 'asc' }
    });
    expect(await response.json()).toEqual([
      {
        id: 'public-ebook',
        title: 'Public guide',
        description: 'Guide',
        category: 'CAREER',
        price: 10,
        thumbnail: '/guide.png'
      }
    ]);
  });
});
