import { describe, expect, it } from 'vitest';
import seedFiles from '../prisma/seed-files.json' with { type: 'json' };
import { copySource, isDevBucket, planDevCopies } from './dev-seed-files.mjs';

const buckets = {
  imageSource: 'image',
  ebookSource: 'document',
  imageTarget: 'image-dev',
  ebookTarget: 'document-dev'
};

describe('planDevCopies', () => {
  it('copies images and documents from production into the -dev buckets', () => {
    const plan = planDevCopies(
      { images: ['home/a.png'], documents: ['ebook-1'] },
      buckets
    );
    expect(plan).toEqual([
      { key: 'home/a.png', source: 'image', target: 'image-dev' },
      { key: 'ebook-1', source: 'document', target: 'document-dev' }
    ]);
  });

  it('refuses targets that are not -dev buckets', () => {
    expect(() =>
      planDevCopies(
        { images: [], documents: [] },
        { ...buckets, imageTarget: 'image' }
      )
    ).toThrow(/must end with -dev/);
    expect(() =>
      planDevCopies(
        { images: [], documents: [] },
        { ...buckets, ebookTarget: 'image-dev' }
      )
    ).toThrow(/must differ/);
  });

  it('refuses -dev buckets as the source', () => {
    expect(() =>
      planDevCopies(
        { images: [], documents: [] },
        { ...buckets, imageSource: 'image-dev' }
      )
    ).toThrow(/production buckets/);
  });

  it('covers every file in prisma/seed-files.json', () => {
    const plan = planDevCopies(seedFiles, buckets);
    expect(plan).toHaveLength(
      seedFiles.images.length + seedFiles.documents.length
    );
    expect(new Set(plan.map((copy) => copy.key)).size).toBe(plan.length);
  });
});

describe('copySource', () => {
  it('encodes each path segment of the key', () => {
    expect(copySource('document', 'TEST - 1 16:49:24')).toBe(
      'document/TEST%20-%201%2016%3A49%3A24'
    );
    expect(copySource('image', 'home/a b.png')).toBe('image/home/a%20b.png');
  });
});

describe('isDevBucket', () => {
  it('only accepts names ending with -dev', () => {
    expect(isDevBucket('image-dev')).toBe(true);
    expect(isDevBucket('image')).toBe(false);
    expect(isDevBucket(undefined)).toBe(false);
  });
});
