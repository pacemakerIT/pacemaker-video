// src/components/__tests__/Card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';
import { OnlineCards } from '@/types/online';

// Mock next/image - className을 전달하도록 수정
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    <img src={src} alt={alt} className={className} data-testid="card-image" />
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
    image: '/test-image.jpg',
    category: 'Interview'
  };

  it('renders card with all props', () => {
    render(<Card {...mockCard} />);

    // Check if title is rendered
    expect(screen.getByText('Test Course')).toBeDefined();

    // Check if price is rendered
    expect(screen.getByText('$49.99')).toBeDefined();

    // Check if description is rendered
    expect(screen.getByText('Test Description')).toBeDefined();

    // Check if category badge is rendered
    expect(screen.getByText('Interview')).toBeDefined();

    // Check if image is rendered
    const image = screen.getByTestId('card-image');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'courses img');
  });

  it('renders card without category', () => {
    const cardWithoutCategory = { ...mockCard, category: undefined };
    render(<Card {...cardWithoutCategory} />);

    // Category badge should not be present
    expect(screen.queryByText('Interview')).toBeNull();
  });

  it('renders card with correct link', () => {
    render(<Card {...mockCard} />);

    const link = screen.getByTestId('card-link');
    expect(link).toHaveAttribute('href', '/courses/1');
  });

  it('renders "자세히 보기" button', () => {
    render(<Card {...mockCard} />);

    const button = screen.getByText('자세히 보기');
    expect(button).toBeDefined();
  });

  it('applies correct styles to card elements', () => {
    render(<Card {...mockCard} />);

    // Check card container styles
    const cardContainer = screen.getByTestId('card-link').firstChild;
    expect(cardContainer).toHaveClass('bg-white');
    expect(cardContainer).toHaveClass('rounded-lg');
    expect(cardContainer).toHaveClass('shadow-sm');

    // Check image styles
    const image = screen.getByTestId('card-image');
    expect(image).toHaveClass('w-full');
    expect(image).toHaveClass('h-64');
    expect(image).toHaveClass('object-cover');

    // Check title styles
    const title = screen.getByText('Test Course');
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-semibold');
  });
});
