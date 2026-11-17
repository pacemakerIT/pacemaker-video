import { describe, expect, it } from 'vitest';
import seedFiles from './seed-files.json';
import {
  COURSES,
  EBOOKS,
  INSTRUCTORS,
  MAIN_VISUALS,
  WORKSHOPS
} from './seed-data';

const imageKeys = [
  ...COURSES.map((course) => course.thumbnail.key),
  ...EBOOKS.map((ebook) => ebook.thumbnail.key),
  ...WORKSHOPS.map((workshop) => workshop.thumbnail.key),
  ...INSTRUCTORS.map((instructor) => instructor.profileImage.key)
];
const documentKeys = EBOOKS.map((ebook) => ebook.file.key);

describe('seed files', () => {
  it('lists exactly the storage keys the seed content uses', () => {
    expect([...new Set(imageKeys)].sort()).toEqual(
      [...seedFiles.images].sort()
    );
    expect([...new Set(documentKeys)].sort()).toEqual(
      [...seedFiles.documents].sort()
    );
  });

  it('has an /img fallback for every image', () => {
    const files = [
      ...COURSES.map((course) => course.thumbnail),
      ...EBOOKS.map((ebook) => ebook.thumbnail),
      ...WORKSHOPS.map((workshop) => workshop.thumbnail),
      ...INSTRUCTORS.map((instructor) => instructor.profileImage)
    ];
    for (const file of files) {
      expect(file.fallback).toMatch(/^\/img\//);
    }
  });
});

describe('seed content', () => {
  it('only links to courses that are seeded', () => {
    const courseIds = new Set(COURSES.map((course) => course.id));
    for (const course of COURSES) {
      for (const link of course.recommendedLinks) {
        const id = link.url.match(/^\/courses\/(.+)$/)?.[1];
        if (id) expect(courseIds.has(id)).toBe(true);
      }
    }
  });

  it('connects courses only to seeded instructors', () => {
    const instructorIds = new Set(INSTRUCTORS.map((i) => i.id));
    for (const course of COURSES) {
      for (const id of course.instructorIds) {
        expect(instructorIds.has(id)).toBe(true);
      }
    }
  });

  it('uses unique ids and order keys', () => {
    const ids = [
      ...MAIN_VISUALS,
      ...COURSES,
      ...COURSES.flatMap((course) => course.sections),
      ...COURSES.flatMap((course) =>
        course.sections.flatMap((section) => section.videos)
      ),
      ...EBOOKS,
      ...WORKSHOPS,
      ...INSTRUCTORS
    ].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const items of [COURSES, EBOOKS, WORKSHOPS]) {
      const keys = items.map((item) => item.orderKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('contains no user or account data', () => {
    const text = JSON.stringify({
      MAIN_VISUALS,
      COURSES,
      EBOOKS,
      WORKSHOPS,
      INSTRUCTORS
    });
    expect(text).not.toMatch(/userId|clerkId|@[a-z0-9-]+\.[a-z]{2,}/i);
  });
});
