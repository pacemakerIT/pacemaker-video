import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGetHandler } from './handler';
import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import type { Mock } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

vi.mock('@/lib/prisma', () => {
  return {
    default: {
      document: {
        findUnique: vi.fn()
      }
    }
  };
});

const { auth } = await import('@clerk/nextjs/server');
const { GetObjectCommand } = await import('@aws-sdk/client-s3');

describe('GET /api/document/[docId]', () => {
  const docId = 'abc123';
  let GET: (
    req: Request,
    { params }: { params: Promise<{ docId: string }> }
  ) => Promise<NextResponse>;
  const mockS3ClientInstance = {
    send: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();

    (auth as unknown as Mock).mockResolvedValue({
      userId: 'user_123'
    });

    GET = createGetHandler(mockS3ClientInstance as unknown as S3Client);
  });

  const createMockRequest = () => {
    return new Request('http://localhost/api/document/abc123', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf'
      }
    });
  };

  it('should return PDF stream with correct headers', async () => {
    const req = createMockRequest();
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode('Test PDF content');

    const webStream = new ReadableStream({
      start(controller) {
        controller.enqueue(uint8Array);
        controller.close();
      }
    });

    mockS3ClientInstance.send.mockResolvedValue({
      Body: webStream
    });

    const result = await GET(req, {
      params: Promise.resolve({ docId: docId })
    });

    expect(mockS3ClientInstance.send).toHaveBeenCalledWith(
      expect.any(GetObjectCommand)
    );

    expect(result.headers.get('Content-Type')).toBe('application/pdf');

    const text = await result.text();
    expect(text).toContain('Test PDF content');
  });

  it('should return 401 if the user is not authenticated', async () => {
    (auth as unknown as Mock).mockResolvedValue({
      userId: null
    });
    const req = createMockRequest();

    const result = await GET(req, {
      params: Promise.resolve({ docId: docId })
    });

    expect(result.status).toBe(401);
    const json = await result.json();
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if docId is missing', async () => {
    const req = new Request('http://localhost/api/document/', {
      method: 'GET'
    });

    const result = await GET(req, {
      params: Promise.resolve({ docId: '' })
    });

    expect(result.status).toBe(400);
    const json = await result.json();
    expect(json).toEqual({ error: 'Missing docId' });
  });

  it('should return 500 if S3 throws an error', async () => {
    const req = createMockRequest();

    mockS3ClientInstance.send.mockRejectedValue(new Error('S3 error'));

    const result = await GET(req, {
      params: Promise.resolve({ docId: docId })
    });

    expect(result.status).toBe(500);
    const json = await result.json();
    expect(json).toEqual({ error: 'Failed to fetch file Error: S3 error' });
  });
});
