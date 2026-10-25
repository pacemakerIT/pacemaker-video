import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  ebookBucketName: 'document'
}));

const { resolveEbookFileLocation } = await import('@/lib/ebook-file-location');

const supabaseUrl = 'https://project.supabase.co';
const options = { supabaseUrl, ebookBucket: 'document' };

describe('resolveEbookFileLocation', () => {
  it('reads the key from an uploaded PDF URL in the ebook bucket', () => {
    expect(
      resolveEbookFileLocation(
        {
          ebookId: 'ebook-1761400000000',
          bucketUrl: `${supabaseUrl}/storage/v1/object/public/document/abc.pdf`
        },
        options
      )
    ).toEqual({ bucket: 'document', key: 'abc.pdf' });
  });

  it('never reads from another bucket, even when bucketUrl points there', () => {
    for (const bucket of ['image', 'videos']) {
      expect(
        resolveEbookFileLocation(
          {
            ebookId: 'ebook-1',
            bucketUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/abc.pdf`
          },
          options
        )
      ).toEqual({ bucket: 'document', key: 'ebook-1' });
    }
  });

  it('falls back to ebookId for other hosts and signed URLs', () => {
    const fallback = { bucket: 'document', key: 'Guide - 251025 10:00:00' };

    for (const bucketUrl of [
      'https://example-bucket.s3.amazonaws.com/ebooks/guide-1.pdf',
      `${supabaseUrl}/storage/v1/s3/document/Guide?X-Amz-Signature=abc`,
      'not a url',
      null
    ]) {
      expect(
        resolveEbookFileLocation(
          { ebookId: 'Guide - 251025 10:00:00', bucketUrl },
          options
        )
      ).toEqual(fallback);
    }
  });

  it('rejects traversal keys in the URL', () => {
    expect(
      resolveEbookFileLocation(
        {
          ebookId: 'ebook-1',
          bucketUrl: `${supabaseUrl}/storage/v1/object/public/document/..%2Fsecret.pdf`
        },
        options
      )
    ).toEqual({ bucket: 'document', key: 'ebook-1' });
  });

  it('returns null when there is nothing to read', () => {
    expect(
      resolveEbookFileLocation({ ebookId: '', bucketUrl: null }, options)
    ).toBeNull();
    expect(
      resolveEbookFileLocation(
        { ebookId: 'ebook-1', bucketUrl: null },
        { supabaseUrl, ebookBucket: '' }
      )
    ).toBeNull();
  });
});
