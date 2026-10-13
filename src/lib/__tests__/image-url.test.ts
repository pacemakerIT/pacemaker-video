import { isStorageObjectKey, resolveImageProxyPath } from '../image-url';
import { resolveImageSrc } from '../utils';

describe('image URL resolution', () => {
  it('recognizes legacy storage object keys', () => {
    expect(isStorageObjectKey('image-123.png')).toBe(true);
    expect(isStorageObjectKey('folder/image-123.webp')).toBe(true);
    expect(isStorageObjectKey('/img/course.png')).toBe(false);
    expect(
      isStorageObjectKey(
        'https://example.supabase.co/storage/v1/object/public/image/image.png'
      )
    ).toBe(false);
  });

  it('uses fileName for legacy storage object keys', () => {
    expect(resolveImageProxyPath('image 123.png')).toBe(
      '/api/images/proxy?fileName=image%20123.png'
    );
  });

  it('uses url for remote URLs', () => {
    expect(resolveImageProxyPath('https://example.com/image.png')).toBe(
      '/api/images/proxy?url=https%3A%2F%2Fexample.com%2Fimage.png'
    );
  });

  it('routes filename-only thumbnails through the fileName fallback', () => {
    expect(resolveImageSrc({ thumbnail: 'legacy-image.png' })).toBe(
      '/api/images/proxy?fileName=legacy-image.png'
    );
  });

  it('preserves local and blob image sources', () => {
    expect(resolveImageSrc({ thumbnail: '/img/course.png' })).toBe(
      '/img/course.png'
    );
    expect(resolveImageSrc({ thumbnail: '/api/images/file/course.png' })).toBe(
      '/api/images/file/course.png'
    );
    expect(
      resolveImageSrc({ thumbnail: 'blob:http://localhost/image-id' })
    ).toBe('blob:http://localhost/image-id');
  });

  it('returns no source when all image values are empty', () => {
    expect(
      resolveImageSrc({
        thumbnail: null,
        thumbnailUrl: '',
        imageUrl: undefined
      })
    ).toBeUndefined();
  });
});
