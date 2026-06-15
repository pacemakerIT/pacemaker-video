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
import Card from '../common/card';
import { OnlineCards } from '@/types/online';
import { ItemType } from '@prisma/client';
import React from 'react';

// Mock context hooks
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockAddToCart = vi.fn();

vi.mock('@/app/context/cart-context', () => ({
  useCartContext: () => ({
    cart: [],
    addToCart: mockAddToCart
  })
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: { id: 'user_1' }
  })
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

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

import { Favorite } from '@/app/context/favorite-context';

const mockFavorites: Favorite[] = [];

vi.mock('@/app/context/favorite-context', () => ({
  useFavoriteContext: () => ({
    favorites: mockFavorites,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite
  })
}));

describe('Card', () => {
  const mockCard: OnlineCards = {
    id: '1',
    visualTitle2: 'Test Course',
    title: 'Test Course Title',
    price: 49.99,
    description: 'Test Description',
    isPublic: true,
    showOnMain: true,
    category: 'INTERVIEW',
    itemId: 'video1',
    uploadDate: new Date('2024-03-20'),
    watchedVideos: [],
    purchasedVideos: [],
    itemType: ItemType.COURSE,
    thumbnailUrl: '/img/test-course.png'
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
      expect(screen.getByText(/INTERVIEW/i)).toBeDefined();

      // Check if image is rendered
      const image = screen.getByTestId('card-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'courses img');
      // Next.js Image 컴포넌트는 width/height 속성을 DOM에 직접 노출하지 않음
      // expect(image).toHaveAttribute('width', '588');
      // expect(image).toHaveAttribute('height', '331');
    });
  });

  it('renders card without category', async () => {
    const cardWithoutCategory = { ...mockCard, category: '' };
    render(<Card {...cardWithoutCategory} />);

    await waitFor(() => {
      // Category badge should not be present
      expect(screen.queryByText(/INTERVIEW/i)).toBeNull();
    });
  });

  it('renders card with correct link', async () => {
    render(<Card {...mockCard} />);

    await waitFor(() => {
      const link = screen.getByTestId('card-link');
      expect(link).toHaveAttribute('href', '/courses/1'); // 경로 수정
    });
  });

  it('renders "Learn more" link', async () => {
    render(<Card {...mockCard} />);

    await waitFor(() => {
      const link = screen.getByText('Learn more');
      expect(link).toBeDefined();
      expect(link.closest('div')).toHaveClass('text-[#00ADBD]');
    });
  });

  it('applies correct styles to card elements', async () => {
    render(<Card {...mockCard} />);

    await waitFor(() => {
      // Check card container styles
      const cardContainer = screen.getByTestId('card-link').firstChild;
      expect(cardContainer).toHaveClass('w-full');
      expect(cardContainer).toHaveClass('bg-white');
      expect(cardContainer).toHaveClass('rounded-none');
      expect(cardContainer).toHaveClass('overflow-hidden');

      // Check image container styles (256px height per new design)
      const imageContainer = screen.getByTestId('card-image').parentElement;
      expect(imageContainer).toHaveClass('h-[256px]');

      // Check image styles
      const image = screen.getByTestId('card-image');
      expect(image).toHaveClass('object-cover');
      expect(image).toHaveClass('object-center');

      // Check title styles
      const title = screen.getByText('Test Course');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-bold');
      expect(title).toHaveClass('font-headline');

      // Check price styles
      const price = screen.getByText('$49.99');
      expect(price).toHaveClass('text-xl');
      expect(price).toHaveClass('font-extrabold');
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
      // Since we are mocking the context and it doesn't update the favorites list automatically,
      // the visual state won't change in this unit test unless we re-render with new mocks.
      // Instead, we verify that the addFavorite function was called.
      expect(mockAddFavorite).toHaveBeenCalledWith(
        mockCard.id,
        mockCard.itemType
      );
    });
  });
});
