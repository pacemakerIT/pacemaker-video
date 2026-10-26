import { describe, expect, it } from 'vitest';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  planThumbnailReplacement
} from './thumbnail-replacement.mjs';

const oldLocation = { bucket: 'image', key: 'old.png' };
const base = {
  newFileName: 'cover.png',
  newFileBytes: 500 * 1024,
  oldLocation,
  oldObjectExists: true,
  otherReferences: 0
};

describe('planThumbnailReplacement', () => {
  it('deletes the old object when nothing else uses it', () => {
    expect(planThumbnailReplacement(base)).toEqual({
      ok: true,
      extension: 'png',
      contentType: 'image/png',
      deleteOldObject: true,
      keepReason: null
    });
  });

  it('rejects a replacement image over 4MB', () => {
    expect(
      planThumbnailReplacement({
        ...base,
        newFileBytes: MAX_IMAGE_UPLOAD_BYTES + 1
      })
    ).toEqual({ ok: false, reason: 'The new image must be 4MB or smaller.' });
  });

  it('accepts a replacement image of exactly 4MB', () => {
    expect(
      planThumbnailReplacement({
        ...base,
        newFileBytes: MAX_IMAGE_UPLOAD_BYTES
      }).ok
    ).toBe(true);
  });

  it('rejects unsupported file types', () => {
    expect(
      planThumbnailReplacement({ ...base, newFileName: 'cover.svg' }).ok
    ).toBe(false);
  });

  it('maps .jpeg to a .jpg key with a JPEG content type', () => {
    expect(
      planThumbnailReplacement({ ...base, newFileName: 'cover.JPEG' })
    ).toMatchObject({ extension: 'jpg', contentType: 'image/jpeg' });
  });

  it('keeps the old object when another record still uses it', () => {
    expect(
      planThumbnailReplacement({ ...base, otherReferences: 2 })
    ).toMatchObject({
      ok: true,
      deleteOldObject: false,
      keepReason: '2 other record(s) still use it'
    });
  });

  it('keeps nothing to delete when the old object is missing or not stored', () => {
    expect(
      planThumbnailReplacement({ ...base, oldObjectExists: false })
    ).toMatchObject({ deleteOldObject: false });
    expect(
      planThumbnailReplacement({ ...base, oldLocation: null })
    ).toMatchObject({ deleteOldObject: false });
  });
});
