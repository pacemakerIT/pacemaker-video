import { describe, expect, it } from 'vitest';
import {
  isMainVisualOnHomePage,
  toMainVisualSlide,
  type MainVisualSlideSource
} from '@/lib/main-visual-slides';

const VISUAL: MainVisualSlideSource = {
  title: 'Get your resume\nreviewed by pros',
  description: 'A clear resume.',
  isPublic: true,
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  link: '/courses',
  linkName: 'Get Started'
};

describe('isMainVisualOnHomePage', () => {
  const now = new Date(2026, 10, 8, 12, 0);

  it('shows public visuals without a window and hides private ones', () => {
    expect(isMainVisualOnHomePage(VISUAL, now)).toBe(true);
    expect(isMainVisualOnHomePage({ ...VISUAL, isPublic: false }, now)).toBe(
      false
    );
  });

  it('applies the start and end window', () => {
    const later = {
      ...VISUAL,
      startDate: new Date(2026, 10, 8),
      startTime: '13:00'
    };
    const ended = {
      ...VISUAL,
      endDate: new Date(2026, 10, 8),
      endTime: '11:59'
    };

    expect(isMainVisualOnHomePage(later, now)).toBe(false);
    expect(isMainVisualOnHomePage(ended, now)).toBe(false);
  });
});

describe('toMainVisualSlide', () => {
  it('alternates colors by home page position', () => {
    expect(toMainVisualSlide(VISUAL, 0).highlightColor).toBe('text-teal');
    expect(toMainVisualSlide(VISUAL, 1).highlightColor).toBe('text-orange');
    expect(toMainVisualSlide(VISUAL, 2).highlightColor).toBe('text-teal');
  });

  it('maps the button and shrinks long titles', () => {
    expect(toMainVisualSlide(VISUAL, 0)).toMatchObject({
      buttonText: 'Get Started',
      link: '/courses',
      titleSizeClass: undefined
    });
    expect(
      toMainVisualSlide({ ...VISUAL, title: 'x'.repeat(35) }, 0).titleSizeClass
    ).toBe('text-[clamp(1.2rem,3vw,1.8rem)]');
  });
});
