import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_UPLOAD_BYTES } from '@/lib/image-upload-limits';

const s3SendMock = vi.fn();
const prismaMock = vi.hoisted(() => ({
  mainVisual: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
}));

vi.mock('@/lib/admin-auth', () => ({
  requireAdminUser: vi.fn(async () => ({ ok: true }))
}));

vi.mock('@/lib/supabase', () => ({
  imgBucketName: 'image',
  s3clientSupabase: { send: (command: unknown) => s3SendMock(command) }
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const { POST } = await import('./route');
const { PUT } = await import('./[id]/route');

function mainVisualForm(imageBytes: number) {
  const formData = new FormData();
  formData.append('title', 'Main visual');
  formData.append('status', 'public');
  formData.append(
    'image',
    new File([new Uint8Array(imageBytes)], 'visual.png', { type: 'image/png' })
  );
  return formData;
}

describe('main visual image size limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    s3SendMock.mockResolvedValue({});
  });

  it('rejects an image over 4MB when creating a main visual', async () => {
    const response = await POST(
      new Request('http://localhost/api/main-visual', {
        method: 'POST',
        body: mainVisualForm(MAX_IMAGE_UPLOAD_BYTES + 1)
      })
    );

    expect(response.status).toBe(413);
    expect(s3SendMock).not.toHaveBeenCalled();
    expect(prismaMock.mainVisual.create).not.toHaveBeenCalled();
  });

  it('rejects an image over 4MB when updating a main visual', async () => {
    const response = await PUT(
      new Request('http://localhost/api/main-visual/visual-1', {
        method: 'PUT',
        body: mainVisualForm(MAX_IMAGE_UPLOAD_BYTES + 1)
      }),
      { params: Promise.resolve({ id: 'visual-1' }) }
    );

    expect(response.status).toBe(413);
    expect(s3SendMock).not.toHaveBeenCalled();
    expect(prismaMock.mainVisual.update).not.toHaveBeenCalled();
  });
});
