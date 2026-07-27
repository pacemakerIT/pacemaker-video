import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const prismaMock = {
  ebook: {
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

vi.mock('@/lib/supabase', () => ({
  bucketName: 'ebooks',
  s3clientSupabase: {}
}));

const { auth } = await import('@clerk/nextjs/server');
const { createGetHandler } = await import('./handler');

function context(ebookId = 'ebook-123') {
  return {
    params: Promise.resolve({ ebookId })
  };
}

describe('ebook file handler', () => {
  const s3Client = {
    send: vi.fn()
  };
  const GET = createGetHandler(s3Client as never);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
    prismaMock.ebook.findUnique.mockResolvedValue({
      id: 'ebook-123',
      ebookId: 'ebook-file.pdf',
      price: 25,
      isPublic: true
    });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123' });
    prismaMock.orderItem.findFirst.mockResolvedValue({
      id: 'order-item-123'
    });
    s3Client.send.mockResolvedValue({
      Body: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('pdf');
        },
        destroy: vi.fn()
      }
    });
  });

  it('requires authentication', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(s3Client.send).not.toHaveBeenCalled();
  });

  it('blocks paid ebooks without a completed purchase', async () => {
    prismaMock.orderItem.findFirst.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Purchase required to view this ebook'
    });
    expect(s3Client.send).not.toHaveBeenCalled();
  });

  it('streams purchased ebook PDFs', async () => {
    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(s3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'ebooks',
          Key: 'ebook-file.pdf'
        })
      })
    );
  });

  it('hides private ebooks from non-admin users even with a direct file URL', async () => {
    prismaMock.ebook.findUnique.mockResolvedValue({
      id: 'ebook-123',
      ebookId: 'private-ebook-file.pdf',
      price: 0,
      isPublic: false
    });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123' });

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Ebook not found' });
    expect(s3Client.send).not.toHaveBeenCalled();
  });

  it('allows admins to stream private ebook PDFs without a purchase', async () => {
    prismaMock.ebook.findUnique.mockResolvedValue({
      id: 'ebook-123',
      ebookId: 'private-ebook-file.pdf',
      price: 25,
      isPublic: false
    });
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });
    prismaMock.orderItem.findFirst.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(200);
    expect(s3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'ebooks',
          Key: 'private-ebook-file.pdf'
        })
      })
    );
    expect(prismaMock.orderItem.findFirst).not.toHaveBeenCalled();
  });
});
