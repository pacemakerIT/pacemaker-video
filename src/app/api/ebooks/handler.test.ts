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

const getSignedUrlMock = vi.fn();

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: getSignedUrlMock
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
    getSignedUrlMock.mockResolvedValue('https://storage.example/signed-ebook');
  });

  it('requires authentication', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(getSignedUrlMock).not.toHaveBeenCalled();
  });

  it('blocks paid ebooks without a completed purchase', async () => {
    prismaMock.orderItem.findFirst.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Purchase required to view this ebook'
    });
    expect(getSignedUrlMock).not.toHaveBeenCalled();
  });

  it('hands purchased readers a short lived signed URL', async () => {
    const response = await GET(new Request('http://localhost'), context());

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({
      url: 'https://storage.example/signed-ebook',
      expiresIn: 600
    });
    expect(getSignedUrlMock).toHaveBeenCalledWith(
      s3Client,
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'ebooks',
          Key: 'ebook-file.pdf'
        })
      }),
      { expiresIn: 600 }
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
    expect(getSignedUrlMock).not.toHaveBeenCalled();
  });

  it('allows admins to open private ebooks without a purchase', async () => {
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
    expect(getSignedUrlMock).toHaveBeenCalledWith(
      s3Client,
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'ebooks',
          Key: 'private-ebook-file.pdf'
        })
      }),
      { expiresIn: 600 }
    );
    expect(prismaMock.orderItem.findFirst).not.toHaveBeenCalled();
  });
});
