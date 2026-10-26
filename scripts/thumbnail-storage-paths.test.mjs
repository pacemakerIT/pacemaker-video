import { describe, expect, it } from 'vitest';
import {
  decideThumbnailAction,
  parseThumbnailLocation,
  publicObjectUrl
} from './thumbnail-storage-paths.mjs';

const supabaseUrl = 'https://project.supabase.co';
const buckets = { sourceBucket: 'document', targetBucket: 'image' };

describe('parseThumbnailLocation', () => {
  it('reads the bucket and key from a Supabase public URL', () => {
    expect(
      parseThumbnailLocation(
        `${supabaseUrl}/storage/v1/object/public/document/abc.png`,
        supabaseUrl
      )
    ).toEqual({ bucket: 'document', key: 'abc.png' });
  });

  it('treats a bare object key as a location with no bucket', () => {
    expect(parseThumbnailLocation('abc.jpeg', supabaseUrl)).toEqual({
      bucket: null,
      key: 'abc.jpeg'
    });
  });

  it('ignores external URLs, site paths, and traversal keys', () => {
    expect(
      parseThumbnailLocation(
        'https://fast.wistia.net/embed/abc.jpg',
        supabaseUrl
      )
    ).toBeNull();
    expect(parseThumbnailLocation('/img/logo.webp', supabaseUrl)).toBeNull();
    expect(
      parseThumbnailLocation(
        `${supabaseUrl}/storage/v1/object/public/document/..%2Fsecret.png`,
        supabaseUrl
      )
    ).toBeNull();
    expect(parseThumbnailLocation(null, supabaseUrl)).toBeNull();
  });
});

describe('publicObjectUrl', () => {
  it('builds a public URL that parses back to the same location', () => {
    const url = publicObjectUrl(`${supabaseUrl}/`, 'image', 'abc.png');

    expect(url).toBe(`${supabaseUrl}/storage/v1/object/public/image/abc.png`);
    expect(parseThumbnailLocation(url, supabaseUrl)).toEqual({
      bucket: 'image',
      key: 'abc.png'
    });
  });
});

describe('decideThumbnailAction', () => {
  const documentLocation = { bucket: 'document', key: 'abc.png' };
  const imageLocation = { bucket: 'image', key: 'abc.png' };

  it('copies an object that exists only in the source bucket', () => {
    expect(
      decideThumbnailAction({
        ...buckets,
        location: documentLocation,
        inTarget: false,
        inSource: true
      })
    ).toBe('copy');
  });

  it('only rewrites the URL when the object is already in the target bucket', () => {
    expect(
      decideThumbnailAction({
        ...buckets,
        location: documentLocation,
        inTarget: true,
        inSource: true
      })
    ).toBe('update');
    expect(
      decideThumbnailAction({
        ...buckets,
        location: { bucket: null, key: 'abc.png' },
        inTarget: true,
        inSource: false
      })
    ).toBe('update');
  });

  it('leaves target-bucket thumbnails alone when the object is there', () => {
    expect(
      decideThumbnailAction({
        ...buckets,
        location: imageLocation,
        inTarget: true,
        inSource: false
      })
    ).toBe('ok');
  });

  it('reports objects found in neither bucket as missing', () => {
    expect(
      decideThumbnailAction({
        ...buckets,
        location: documentLocation,
        inTarget: false,
        inSource: false
      })
    ).toBe('missing');
  });

  it('skips thumbnails outside the two buckets', () => {
    expect(
      decideThumbnailAction({
        ...buckets,
        location: { bucket: 'videos', key: 'abc.png' },
        inTarget: false,
        inSource: false
      })
    ).toBe('skip');
    expect(
      decideThumbnailAction({
        ...buckets,
        location: null,
        inTarget: false,
        inSource: false
      })
    ).toBe('skip');
  });
});
