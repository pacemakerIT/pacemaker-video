import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGetHandler } from './handler';
import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import type { Mock } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const getSignedUrlMock = vi.hoisted(() => vi.fn());

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: getSignedUrlMock
}));

const prismaMock = vi.hoisted(() => ({
  ebook: {
    findUnique: vi.fn()
  },
  user: {
    findUnique: vi.fn()
  },
  orderItem: {
    findFirst: vi.fn()
  }
}));

vi.mock('@/lib/prisma', () => {
  return {
    default: prismaMock
  };
});

const { auth } = await import('@clerk/nextjs/server');
const { GetObjectCommand } = await import('@aws-sdk/client-s3');

describe('GET /api/ebooks/[ebookId]', () => {
  const ebookId = 'abc123';
  let GET: (
    req: Request,
    { params }: { params: Promise<{ ebookId: string }> }
  ) => Promise<NextResponse>;
  const mockS3ClientInstance = {
    send: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();

    (auth as unknown as Mock).mockResolvedValue({
      userId: 'user_123'
    });
    prismaMock.ebook.findUnique.mockResolvedValue({
      id: ebookId,
      ebookId: 'ebook-file.pdf',
      price: 25,
      isPublic: true
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'app-user-123'
    });
    prismaMock.orderItem.findFirst.mockResolvedValue({
      id: 'order-item-123'
    });

    getSignedUrlMock.mockResolvedValue('https://storage.example/signed-ebook');

    GET = createGetHandler(mockS3ClientInstance as unknown as S3Client);
  });

  const createMockRequest = () => {
    return new Request('http://localhost/api/ebooks/abc123', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf'
      }
    });
  };

  it('should return a signed URL instead of the file bytes', async () => {
    const req = createMockRequest();

    const result = await GET(req, {
      params: Promise.resolve({ ebookId: ebookId })
    });

    expect(getSignedUrlMock).toHaveBeenCalledWith(
      mockS3ClientInstance,
      expect.any(GetObjectCommand),
      { expiresIn: 600 }
    );

    expect(result.headers.get('Cache-Control')).toBe('no-store');
    expect(await result.json()).toEqual({
      url: 'https://storage.example/signed-ebook',
      expiresIn: 600
    });
  });

  it('should return 401 if the user is not authenticated', async () => {
    (auth as unknown as Mock).mockResolvedValue({
      userId: null
    });
    const req = createMockRequest();

    const result = await GET(req, {
      params: Promise.resolve({ ebookId: ebookId })
    });

    expect(result.status).toBe(401);
    const json = await result.json();
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if ebookId is missing', async () => {
    const req = new Request('http://localhost/api/ebooks/', {
      method: 'GET'
    });

    const result = await GET(req, {
      params: Promise.resolve({ ebookId: '' })
    });

    expect(result.status).toBe(400);
    const json = await result.json();
    expect(json).toEqual({ error: 'Missing ebookId' });
  });

  it('should return 500 if signing throws an error', async () => {
    const req = createMockRequest();

    getSignedUrlMock.mockRejectedValue(new Error('S3 error'));

    const result = await GET(req, {
      params: Promise.resolve({ ebookId: ebookId })
    });

    expect(result.status).toBe(500);
    const json = await result.json();
    expect(json).toEqual({ error: 'Failed to fetch file Error: S3 error' });
  });
});
