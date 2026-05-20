import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ListHeader from '../common/list-header';
import React from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

// Mock embla-carousel-react
vi.mock('embla-carousel-react', () => {
  const mockEmblaApi = {
    on: vi.fn(),
    off: vi.fn(),
    scrollTo: vi.fn(),
    scrollNext: vi.fn(),
    canScrollPrev: () => true,
    canScrollNext: () => true,
    selectedScrollSnap: () => 0,
    scrollSnaps: () => [0, 1, 2],
    scrollProgress: () => 0,
    options: () => ({
      mediaQueries: []
    })
  };

  const useEmblaCarousel = () => {
    return [vi.fn(), mockEmblaApi];
  };

  return {
    default: useEmblaCarousel
  };
});

describe('ListHeader', () => {
  it('renders default slides when no slides provided', () => {
    render(<ListHeader />);
    expect(screen.getByText('Pacemaker Career Services')).toBeInTheDocument();
    expect(screen.getByText(/Not sure where to start/i)).toBeInTheDocument();
  });

  it('renders custom slides when slides are provided', () => {
    const customSlides = [
      {
        tag: 'Custom Tag',
        tagColor: 'rgba(0, 173, 189, 0.85)',
        title: 'Custom Title',
        highlight: 'Highlight',
        highlightColor: 'text-teal',
        description: 'Custom Description',
        buttonText: 'Click Me',
        link: '/custom'
      }
    ];

    render(<ListHeader slides={customSlides} />);
    expect(screen.getByText('Custom Tag')).toBeInTheDocument();
    expect(screen.getByText(/Custom Title/i)).toBeInTheDocument();
    expect(screen.getByText('Highlight')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Click Me' })
    ).toBeInTheDocument();
  });

  it('renders without CTA button when buttonText is not provided', () => {
    const customSlides = [
      {
        tag: 'Custom Tag',
        tagColor: 'rgba(0, 173, 189, 0.85)',
        title: 'Custom Title',
        highlight: 'Highlight',
        highlightColor: 'text-teal',
        description: 'Custom Description'
      }
    ];

    render(<ListHeader slides={customSlides} />);
    // The CTA button should not exist. Only dots navigation button(s) should be there.
    const ctaButton = screen.queryByRole('button', { name: 'Click Me' });
    expect(ctaButton).not.toBeInTheDocument();
  });

  it('renders with custom gradient colors style', () => {
    const gradientColors = {
      start: '#FF0000',
      middle: '#00FF00',
      end: '#0000FF'
    };

    render(<ListHeader gradientColors={gradientColors} />);

    const header = screen.getByTestId('list-header');
    expect(header.style.backgroundImage).toBe(
      'linear-gradient(135deg, #FF0000, #00FF00, #0000FF)'
    );
  });

  it('renders slides with dots navigation', () => {
    const slides = [
      {
        tag: 'Tag 1',
        tagColor: 'red',
        title: 'Title 1',
        highlight: 'Highlight 1',
        highlightColor: 'text-teal',
        description: 'Description 1'
      },
      {
        tag: 'Tag 2',
        tagColor: 'blue',
        title: 'Title 2',
        highlight: 'Highlight 2',
        highlightColor: 'text-teal',
        description: 'Description 2'
      }
    ];

    render(<ListHeader slides={slides} />);

    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots).toHaveLength(slides.length);
  });

  it('auto plays slides when interval is provided', () => {
    const slides = [
      {
        tag: 'Tag 1',
        tagColor: 'red',
        title: 'Title 1',
        highlight: 'Highlight 1',
        highlightColor: 'text-teal',
        description: 'Description 1'
      }
    ];

    vi.useFakeTimers();
    render(<ListHeader slides={slides} autoPlayInterval={1000} />);

    // Fast-forward timers
    vi.advanceTimersByTime(1000);

    // Clean up
    vi.useRealTimers();
  });
});
