import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ListHeader from '../list-header';

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
    scrollProgress: () => 0
  };

  const useEmblaCarousel = () => [vi.fn(), mockEmblaApi];

  return {
    default: useEmblaCarousel,
    useEmblaCarousel
  };
});

describe('ListHeader', () => {
  it('renders with basic props', () => {
    render(<ListHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders without button when buttonText is not provided', () => {
    render(<ListHeader title="Test Title" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with custom height and gradient', () => {
    const height = 'h-64';
    const gradientColors = {
      start: '#FF0000',
      middle: '#00FF00',
      end: '#0000FF'
    };

    render(
      <ListHeader
        title="Test Title"
        height={height}
        gradientColors={gradientColors}
      />
    );

    const header = screen.getByTestId('list-header');
    expect(header).toHaveClass(height);
  });

  it('renders slides with dots navigation', () => {
    const slides = [
      { title: 'Slide 1' },
      { title: 'Slide 2' },
      { title: 'Slide 3' }
    ];

    render(<ListHeader title="Test Title" slides={slides} />);

    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots).toHaveLength(slides.length);
  });

  it('renders slides without buttons', () => {
    const slides = [{ title: 'Slide 1' }, { title: 'Slide 2' }];

    render(<ListHeader title="Test Title" slides={slides} />);

    const slidesElements = screen.getAllByText(/Slide \d/);
    expect(slidesElements).toHaveLength(slides.length);
  });

  it('auto plays slides when interval is provided', () => {
    const slides = [{ title: 'Slide 1' }, { title: 'Slide 2' }];

    vi.useFakeTimers();
    render(
      <ListHeader title="Test Title" slides={slides} autoPlayInterval={1000} />
    );

    // Fast-forward timers
    vi.advanceTimersByTime(1000);

    // Clean up
    vi.useRealTimers();
  });

  it('does not auto play when no interval is provided', () => {
    const slides = [{ title: 'Slide 1' }, { title: 'Slide 2' }];

    vi.useFakeTimers();
    render(<ListHeader title="Test Title" slides={slides} />);

    // Fast-forward timers
    vi.advanceTimersByTime(1000);

    // Clean up
    vi.useRealTimers();
  });
});
