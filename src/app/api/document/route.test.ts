import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGetHandler } from './handler';
import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { TextEncoder } from 'util';
import type { Mock } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const { auth } = await import('@clerk/nextjs/server');
const { GetObjectCommand } = await import('@aws-sdk/client-s3');

describe('GET /api/download', () => {
  const filePath = 'test.pdf';
  const bucketName = 'test-bucket';
  let GET: (req: Request) => Promise<NextResponse>;
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

  const createRequest = (params: Record<string, string>) => {
    const url = new URL('http://localhost/api/download');
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );
    return new Request(url.toString(), { method: 'GET' });
  };

  it('should return PDF stream with correct headers', async () => {
    const req = createRequest({ filePath, bucketName });
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

    const result = await GET(req);

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
    const req = createRequest({ filePath, bucketName });
    const result = await GET(req);

    expect(result.status).toBe(401);
    const json = await result.json();
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if filePath or bucketName is missing', async () => {
    const req = createRequest({ bucketName });
    const result = await GET(req);

    expect(result.status).toBe(400);
    const json = await result.json();
    expect(json).toEqual({ error: 'Missing filePath or bucketName' });
  });

  it('should return 500 if S3 throws an error', async () => {
    const req = createRequest({ filePath, bucketName });

    mockS3ClientInstance.send.mockRejectedValue(new Error('S3 error'));

    const result = await GET(req);

    expect(result.status).toBe(500);
    const json = await result.json();
    expect(json).toEqual({ error: 'Failed to fetch file Error: S3 error' });
  });
});
