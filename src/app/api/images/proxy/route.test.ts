import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@aws-sdk/client-s3', () => ({ GetObjectCommand: vi.fn() }));
vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ default: { image: { findFirst: vi.fn() } } }));
vi.mock('@/lib/supabase', () => ({
  bucketName: 'document',
  imgBucketName: 'image',
  s3clientSupabase: {}
}));

const { GET } = await import('./route');
const { readImageResponse } = await import('@/lib/image-response');
const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = await import('@aws-sdk/client-s3');
const { default: prisma } = await import('@/lib/prisma');

describe('GET /api/images/proxy', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('rejects arbitrary external hosts before requesting a signed URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');

    const response = await GET(
      new Request(
        'http://localhost/api/images/proxy?url=https%3A%2F%2Fexample.com%2Fimage.png'
      )
    );

    expect(response.status).toBe(400);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('rejects non-HTTPS schemes and raw storage keys in the URL parameter', async () => {
    const ftpResponse = await GET(
      new Request(
        'http://localhost/api/images/proxy?url=ftp%3A%2F%2Fexample.com%2Fimage.png'
      )
    );
    const rawKeyResponse = await GET(
      new Request('http://localhost/api/images/proxy?url=guessed.png')
    );

    expect(ftpResponse.status).toBe(400);
    expect(rawKeyResponse.status).toBe(400);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('keeps approved image CDN URLs working', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('image-data', {
        headers: { 'Content-Type': 'image/png' }
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET(
      new Request(
        'http://localhost/api/images/proxy?url=https%3A%2F%2Ffast.wistia.net%2Fimages%2Fexample.png'
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('rejects non-image storage buckets', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');

    const response = await GET(
      new Request(
        'http://localhost/api/images/proxy?url=https%3A%2F%2Fproject.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fdocument%2Fprivate.pdf'
      )
    );

    expect(response.status).toBe(400);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('proxies safe storage keys when no image database record exists', async () => {
    vi.mocked(prisma.image.findFirst).mockResolvedValue(null);
    vi.mocked(getSignedUrl).mockResolvedValue(
      'https://storage.example/signed-image'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { 'Content-Type': 'image/png' }
        })
      )
    );

    const response = await GET(
      new Request(
        'http://localhost/api/images/proxy?fileName=502be9ee-af7f-4f83-9560-0a3acf911f08.png'
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(prisma.image.findFirst).toHaveBeenCalledWith({
      where: { fileName: '502be9ee-af7f-4f83-9560-0a3acf911f08.png' }
    });
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: 'image',
      Key: '502be9ee-af7f-4f83-9560-0a3acf911f08.png'
    });
    expect(await response.arrayBuffer()).toEqual(
      new Uint8Array([1, 2, 3]).buffer
    );
  });

  it('rejects unsafe file names when no image record exists', async () => {
    vi.mocked(prisma.image.findFirst).mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/images/proxy?fileName=..%2Fprivate.png')
    );

    expect(response.status).toBe(400);
    expect(getSignedUrl).not.toHaveBeenCalled();
  });
});

describe('readImageResponse', () => {
  it('stops reading a stream as soon as its actual size exceeds the limit', async () => {
    let cancelled = false;
    const response = new Response(
      new ReadableStream<Uint8Array>({
        pull(controller) {
          controller.enqueue(new Uint8Array([1, 2, 3]));
          controller.enqueue(new Uint8Array([4, 5, 6]));
        },
        cancel() {
          cancelled = true;
        }
      }),
      { headers: { 'Content-Type': 'image/png' } }
    );

    await expect(readImageResponse(response, 5)).resolves.toEqual({
      ok: false,
      status: 413
    });
    expect(cancelled).toBe(true);
  });

  it('rejects SVG responses and known oversized content lengths', async () => {
    const svg = await readImageResponse(
      new Response('<svg/>', { headers: { 'Content-Type': 'image/svg+xml' } }),
      10
    );
    const oversized = await readImageResponse(
      new Response('x', {
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': '11'
        }
      }),
      10
    );

    expect(svg).toEqual({ ok: false, status: 415 });
    expect(oversized).toEqual({ ok: false, status: 413 });
  });
});
