import { describe, expect, it } from 'vitest';
import {
  formatCourseCareer,
  formatCourseCareers,
  normalizeCourseCareers
} from '../course-form-data';

describe('normalizeCourseCareers', () => {
  it('preserves legacy current-position careers in the admin form format', () => {
    expect(
      normalizeCourseCareers([
        { period: '2019 ~', position: 'Managing Director at Pacemaker' }
      ])
    ).toEqual([
      {
        startDate: '2019',
        endDate: '',
        isCurrent: true,
        description: 'Managing Director at Pacemaker'
      }
    ]);
  });

  it('preserves legacy date-range careers in the admin form format', () => {
    expect(
      normalizeCourseCareers([
        {
          period: '2015 ~ 2019',
          position: 'Director of Operations at Metanet'
        }
      ])
    ).toEqual([
      {
        startDate: '2015',
        endDate: '2019',
        isCurrent: false,
        description: 'Director of Operations at Metanet'
      }
    ]);
  });

  it('supports canonical and serialized career data', () => {
    const canonical = {
      startDate: '2020',
      endDate: '',
      isCurrent: true,
      description: 'Career Coach'
    };

    expect(normalizeCourseCareers([canonical])).toEqual([canonical]);
    expect(normalizeCourseCareers(JSON.stringify([canonical]))).toEqual([
      canonical
    ]);
  });

  it('normalizes legacy current markers and clears stale end dates', () => {
    expect(
      normalizeCourseCareers([
        { period: '2019 - Present', position: 'Career Coach' },
        {
          startDate: '2020',
          endDate: '2023',
          isCurrent: true,
          description: 'Current Role'
        }
      ])
    ).toEqual([
      {
        startDate: '2019',
        endDate: '',
        isCurrent: true,
        description: 'Career Coach'
      },
      {
        startDate: '2020',
        endDate: '',
        isCurrent: true,
        description: 'Current Role'
      }
    ]);
  });

  it('returns trim-safe empty values for invalid or missing career data', () => {
    const emptyCareer = {
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: ''
    };

    expect(normalizeCourseCareers(null)).toEqual([emptyCareer]);
    expect(normalizeCourseCareers('invalid json')).toEqual([emptyCareer]);
    expect(normalizeCourseCareers([{}])).toEqual([emptyCareer]);
  });

  it('renders both legacy and canonical career data without losing content', () => {
    expect(
      formatCourseCareer({
        period: '2019 ~',
        position: 'Managing Director at Pacemaker'
      })
    ).toEqual({
      period: '2019 ~',
      position: 'Managing Director at Pacemaker'
    });

    expect(
      formatCourseCareer({
        startDate: '2015',
        endDate: '2019',
        isCurrent: false,
        description: 'Director of Operations at Metanet'
      })
    ).toEqual({
      period: '2015 ~ 2019',
      position: 'Director of Operations at Metanet'
    });
  });

  it('formats only renderable public careers from malformed and serialized data', () => {
    expect(formatCourseCareers(null)).toEqual([]);
    expect(formatCourseCareers('not json')).toEqual([]);
    expect(
      formatCourseCareers(
        JSON.stringify([
          { startDate: '2020', isCurrent: true, description: 'Career Coach' },
          {},
          null
        ])
      )
    ).toEqual([{ period: '2020 ~', position: 'Career Coach' }]);
  });
});
