/* eslint-disable @next/next/no-img-element */
// src/components/__tests__/Card.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  cleanup,
  fireEvent
} from '@testing-library/react';
import Card from '../Card';
import { OnlineCards } from '@/types/online';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
    width,
    height
  }: {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      data-testid="card-image"
    />
  )
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} data-testid="card-link">
      {children}
    </a>
  )
}));

describe('Card', () => {
  const mockCard: OnlineCards = {
    id: '1',
    title: 'Test Course',
    price: 49.99,
    description: 'Test Description',
    category: 'INTERVIEW',
    videoId: 'video1',
    uploadDate: new Date('2024-03-20'),
    watchedVideos: [],
    purchasedVideos: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders card with all props', async () => {
    render(<Card {...mockCard} />);

    await waitFor(() => {
      // Check if title is rendered
      expect(screen.getByText('Test Course')).toBeDefined();

      // Check if price is rendered
      expect(screen.getByText('$49.99')).toBeDefined();

      // Check if description is rendered
      expect(screen.getByText('Test Description')).toBeDefined();

      // Check if category badge is rendered
      expect(screen.getByText('INTERVIEW')).toBeDefined();

      // Check if image is rendered
      const image = screen.getByTestId('card-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'courses img');
      expect(image).toHaveAttribute('width', '588');
      expect(image).toHaveAttribute('height', '331');
    });
  });

  it('renders card without category', async () => {
    const cardWithoutCategory = { ...mockCard, category: '' };
    render(<Card {...cardWithoutCategory} />);

    await waitFor(() => {
      // Category badge should not be present
      expect(screen.queryByText('INTERVIEW')).toBeNull();
    });
  });

  it('renders card with correct link', async () => {
    render(<Card {...mockCard} />);

    await waitFor(() => {
      const link = screen.getByTestId('card-link');
      expect(link).toHaveAttribute('href', '/courses/video1');
    });
  });

  it('renders "자세히 보기" button', async () => {
    render(<Card {...mockCard} />);

    await waitFor(() => {
      const button = screen.getByText('자세히 보기');
      expect(button).toBeDefined();
      expect(button).toHaveClass('text-[#ED642D]');
    });
  });

  it('applies correct styles to card elements', async () => {
    render(<Card {...mockCard} />);

    await waitFor(() => {
      // Check card container styles
      const cardContainer = screen.getByTestId('card-link').firstChild;
      expect(cardContainer).toHaveClass('w-[588px]');
      expect(cardContainer).toHaveClass('bg-white');
      expect(cardContainer).toHaveClass('rounded-lg');
      expect(cardContainer).toHaveClass('shadow-sm');
      expect(cardContainer).toHaveClass('border-[#EEEEEE]');

      // Check image container styles
      const imageContainer = screen.getByTestId('card-image').parentElement;
      expect(imageContainer).toHaveClass('h-[331px]');

      // Check image styles
      const image = screen.getByTestId('card-image');
      expect(image).toHaveClass('w-full');
      expect(image).toHaveClass('h-[331px]');
      expect(image).toHaveClass('object-cover');
      expect(image).toHaveClass('rounded-lg');

      // Check title styles
      const title = screen.getByText('Test Course');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('pace-gray-500');

      // Check price styles
      const price = screen.getByText('$49.99');
      expect(price).toHaveClass('text-[28px]');
      expect(price).toHaveClass('font-bold');
    });
  });

  it('toggles like button state when clicked', async () => {
    render(<Card {...mockCard} />);

    const likeButton = await screen.findByRole('button', { name: 'like' });
    expect(likeButton).toBeInTheDocument();
    expect(likeButton).toHaveClass('absolute');
    expect(likeButton).toHaveClass('top-4');
    expect(likeButton).toHaveClass('right-4');

    // Check initial state
    const heartIcon = likeButton.querySelector('svg');
    expect(heartIcon).toHaveClass('text-pace-gray-200');

    // Click the button
    fireEvent.click(likeButton);

    // Wait for state change
    await waitFor(() => {
      expect(heartIcon).toHaveClass('text-pace-orange-800');
      expect(heartIcon).toHaveClass('fill-pace-orange-800');
    });
  });
});
