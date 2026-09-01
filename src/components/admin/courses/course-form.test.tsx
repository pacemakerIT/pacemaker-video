import { describe, expect, it } from 'vitest';
import { getCourseFormValidationErrors } from './course-form';

describe('getCourseFormValidationErrors', () => {
  it('handles missing career fields from existing course data without throwing', () => {
    const errors = getCourseFormValidationErrors({
      category: 'test',
      isPublic: '공개',
      showOnMain: false,
      title: 'Course title',
      intro: 'Intro',
      processTitle: '',
      processContent: '',
      videoLink: 'https://example.com',
      price: '10000',
      time: '60분',
      thumbnail: null,
      thumbnailUrl: 'https://example.com/thumb.jpg',
      visualTitle: 'Visual',
      visualTitle2: 'Visual 2',
      recommended: ['item'],
      sections: [{ title: 'Section', content: 'Content' }],
      instructors: [
        {
          name: 'Instructor',
          intro: 'Intro',
          careers: [
            {
              startDate: undefined as unknown as string,
              endDate: undefined as unknown as string,
              description: undefined as unknown as string,
              isCurrent: false
            }
          ],
          photo: null,
          photoUrl: ''
        }
      ],
      links: [{ url: 'https://example.com', name: 'Link' }]
    });

    expect(errors.instructors?.[0]?.careers?.[0]?.startDate).toBe(
      '시작일을 입력해주세요.'
    );
    expect(errors.instructors?.[0]?.careers?.[0]?.endDate).toBe(
      '종료일을 입력해주세요.'
    );
    expect(errors.instructors?.[0]?.careers?.[0]?.description).toBe(
      '이력 내용을 입력해주세요.'
    );
  });
});
