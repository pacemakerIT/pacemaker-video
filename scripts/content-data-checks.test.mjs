import { describe, expect, it } from 'vitest';
import {
  classifyImageValue,
  isPlaceholderValue,
  isStaleWorkshop,
  resolveEbookFile
} from './content-data-checks.mjs';
import { publicObjectUrl } from './thumbnail-storage-paths.mjs';

const supabaseUrl = 'https://project.supabase.co';
const ebookOptions = { supabaseUrl, ebookBucket: 'document' };

describe('isPlaceholderValue', () => {
  it('flags the old seed ebook URL and the undefined bucket', () => {
    expect(
      isPlaceholderValue('https://example-bucket.s3.amazonaws.com/ebooks/1.pdf')
    ).toBe(true);
    expect(
      isPlaceholderValue(
        `${supabaseUrl}/storage/v1/object/public/undefined/a.png`
      )
    ).toBe(true);
  });

  it('accepts real storage URLs and non-strings', () => {
    expect(
      isPlaceholderValue(`${supabaseUrl}/storage/v1/object/public/image/a.png`)
    ).toBe(false);
    expect(isPlaceholderValue(null)).toBe(false);
  });
});

describe('classifyImageValue', () => {
  it('separates empty, local, storage, and other values', () => {
    expect(classifyImageValue('', supabaseUrl)).toEqual({ kind: 'empty' });
    expect(classifyImageValue('/img/a.png', supabaseUrl)).toEqual({
      kind: 'local',
      path: '/img/a.png'
    });
    expect(
      classifyImageValue(
        `${supabaseUrl}/storage/v1/object/public/image/a.png`,
        supabaseUrl
      )
    ).toEqual({ kind: 'storage', bucket: 'image', key: 'a.png' });
    expect(classifyImageValue('a.png', supabaseUrl)).toEqual({
      kind: 'storage',
      bucket: null,
      key: 'a.png'
    });
    expect(
      classifyImageValue('https://example.com/a.png', supabaseUrl)
    ).toEqual({ kind: 'other' });
  });
});

describe('resolveEbookFile', () => {
  it('reads the key from a public URL of the ebook bucket', () => {
    const bucketUrl = publicObjectUrl(
      supabaseUrl,
      'document',
      'TEST - 1 16:49:24'
    );
    expect(
      resolveEbookFile({ ebookId: 'ebook-5', bucketUrl }, ebookOptions)
    ).toEqual({
      bucket: 'document',
      key: 'TEST - 1 16:49:24',
      usesFallback: false
    });
  });

  it('falls back to ebookId for other URLs, like the app does', () => {
    expect(
      resolveEbookFile(
        {
          ebookId: 'ebook-3',
          bucketUrl: 'https://example-bucket.s3.amazonaws.com/ebooks/3.pdf'
        },
        ebookOptions
      )
    ).toEqual({ bucket: 'document', key: 'ebook-3', usesFallback: true });
    expect(
      resolveEbookFile(
        {
          ebookId: 'ebook-3',
          bucketUrl: `${supabaseUrl}/storage/v1/object/public/image/3.pdf`
        },
        ebookOptions
      )
    ).toEqual({ bucket: 'document', key: 'ebook-3', usesFallback: true });
  });

  it('returns null without an ebook bucket', () => {
    expect(
      resolveEbookFile(
        { ebookId: 'ebook-1', bucketUrl: '' },
        { supabaseUrl, ebookBucket: '' }
      )
    ).toBeNull();
  });
});

describe('isStaleWorkshop', () => {
  const now = new Date('2026-11-02T12:00:00Z');

  it('flags ended workshops that are still Open or Closed', () => {
    expect(
      isStaleWorkshop({ status: 'OPEN', endDate: '2026-08-10T21:00:00Z' }, now)
    ).toBe(true);
    expect(
      isStaleWorkshop(
        { status: 'CLOSED', endDate: '2026-08-10T21:00:00Z' },
        now
      )
    ).toBe(true);
  });

  it('ignores upcoming, completed, and hidden workshops', () => {
    expect(
      isStaleWorkshop({ status: 'OPEN', endDate: '2026-11-05T21:00:00Z' }, now)
    ).toBe(false);
    expect(
      isStaleWorkshop(
        { status: 'COMPLETED', endDate: '2026-01-15T21:00:00Z' },
        now
      )
    ).toBe(false);
    expect(
      isStaleWorkshop(
        { status: 'HIDDEN', endDate: '2026-01-15T21:00:00Z' },
        now
      )
    ).toBe(false);
  });
});
