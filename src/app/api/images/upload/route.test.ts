import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_UPLOAD_BYTES } from '@/lib/image-upload-limits';

const s3SendMock = vi.fn();
const imageCreateMock = vi.fn();
const requireAdminUserMock = vi.fn();
const buckets = vi.hoisted(() => ({ ebook: 'document', image: 'image' }));

vi.mock('@/lib/admin-auth', () => ({
  requireAdminUser: () => requireAdminUserMock()
}));

vi.mock('@/lib/supabase', () => ({
  get ebookBucketName() {
    return buckets.ebook;
  },
  get imgBucketName() {
    return buckets.image;
  },
  s3clientSupabase: { send: (command: unknown) => s3SendMock(command) }
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    image: { create: imageCreateMock },
    ebook: { update: vi.fn() }
  }
}));

const { POST } = await import('./route');
const { resolveEbookFileLocation } = await import('@/lib/ebook-file-location');

function uploadRequest(file: File, fields: Record<string, string>) {
  const formData = new FormData();
  formData.append('image', file);
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  return new Request('http://localhost:3000/api/images/upload', {
    method: 'POST',
    body: formData
  });
}

function fileOfSize(bytes: number, name: string, type: string) {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe('POST /api/images/upload size limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    buckets.ebook = 'document';
    buckets.image = 'image';
    requireAdminUserMock.mockResolvedValue({ ok: true });
    s3SendMock.mockResolvedValue({});
    imageCreateMock.mockImplementation(async ({ data }) => ({
      id: 'image-1',
      ...data
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects an image over 4MB before storing it', async () => {
    const response = await POST(
      uploadRequest(
        fileOfSize(MAX_IMAGE_UPLOAD_BYTES + 1, 'cover.png', 'image/png'),
        { table: 'Ebook', column: 'thumbnail' }
      )
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: '이미지는 4MB 이하만 올릴 수 있습니다.'
    });
    expect(s3SendMock).not.toHaveBeenCalled();
    expect(imageCreateMock).not.toHaveBeenCalled();
  });

  it('accepts an image of exactly 4MB', async () => {
    const response = await POST(
      uploadRequest(
        fileOfSize(MAX_IMAGE_UPLOAD_BYTES, 'cover.png', 'image/png'),
        { type: 'COURSE_THUMBNAIL' }
      )
    );

    expect(response.status).toBe(201);
    expect(s3SendMock).toHaveBeenCalledTimes(1);
    expect(s3SendMock.mock.calls[0][0].input.Bucket).toBe('image');
  });

  it('does not apply the image limit to ebook documents', async () => {
    const response = await POST(
      uploadRequest(
        fileOfSize(MAX_IMAGE_UPLOAD_BYTES + 1, 'book.pdf', 'application/pdf'),
        { table: 'Ebook', column: 'bucketUrl' }
      )
    );

    expect(response.status).toBe(201);
    expect(s3SendMock).toHaveBeenCalledTimes(1);
    expect(s3SendMock.mock.calls[0][0].input.Bucket).toBe('document');
  });

  it('checks admin access before looking at the file', async () => {
    requireAdminUserMock.mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Forbidden'
    });

    const response = await POST(
      uploadRequest(
        fileOfSize(MAX_IMAGE_UPLOAD_BYTES + 1, 'cover.png', 'image/png'),
        { type: 'COURSE_THUMBNAIL' }
      )
    );

    expect(response.status).toBe(403);
    expect(s3SendMock).not.toHaveBeenCalled();
  });

  it('returns 400 when no file is sent', async () => {
    const formData = new FormData();
    formData.append('type', 'COURSE_THUMBNAIL');

    const response = await POST(
      new Request('http://localhost:3000/api/images/upload', {
        method: 'POST',
        body: formData
      })
    );

    expect(response.status).toBe(400);
    expect(s3SendMock).not.toHaveBeenCalled();
  });

  it('returns 503 instead of a storage error when the bucket is not configured', async () => {
    buckets.image = '';

    const response = await POST(
      uploadRequest(fileOfSize(1024, 'cover.png', 'image/png'), {
        type: 'COURSE_THUMBNAIL'
      })
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Storage bucket is not configured'
    });
    expect(s3SendMock).not.toHaveBeenCalled();
    expect(imageCreateMock).not.toHaveBeenCalled();
  });

  it('returns a PDF URL that ebook reads resolve to the same object', async () => {
    const response = await POST(
      uploadRequest(fileOfSize(1024, 'book.pdf', 'application/pdf'), {
        table: 'Ebook',
        column: 'bucketUrl'
      })
    );
    const { url } = await response.json();
    const storedKey = s3SendMock.mock.calls[0][0].input.Key;

    expect(
      resolveEbookFileLocation(
        { ebookId: 'ebook-1761400000000', bucketUrl: url },
        { supabaseUrl: 'https://project.supabase.co', ebookBucket: 'document' }
      )
    ).toEqual({ bucket: 'document', key: storedKey });
  });
});
