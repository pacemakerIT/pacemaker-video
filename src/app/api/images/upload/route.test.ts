import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_UPLOAD_BYTES } from '@/lib/image-upload-limits';

const s3SendMock = vi.fn();
const imageCreateMock = vi.fn();

vi.mock('@/lib/admin-auth', () => ({
  requireAdminUser: vi.fn(async () => ({ ok: true }))
}));

vi.mock('@/lib/supabase', () => ({
  ebookBucketName: 'document',
  imgBucketName: 'image',
  s3clientSupabase: { send: s3SendMock }
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    image: { create: imageCreateMock },
    ebook: { update: vi.fn() }
  }
}));

const { POST } = await import('./route');

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
    s3SendMock.mockResolvedValue({});
    imageCreateMock.mockImplementation(async ({ data }) => ({
      id: 'image-1',
      ...data
    }));
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
});
