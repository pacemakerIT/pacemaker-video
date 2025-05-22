// src/components/__tests__/CardContainer.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CardContainer from '../CardContainer';
import { OnlineCards } from '@/types/online';

// Mock the Card component
vi.mock('../Card', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="card">{title}</div>
  )
}));

describe('CardContainer', () => {
  const mockCards: OnlineCards[] = [
    {
      id: '1',
      title: 'Test Card 1',
      price: 49.99,
      description: 'Test Description 1',
      image: '/test-image-1.jpg',
      category: 'Interview'
    },
    {
      id: '2',
      title: 'Test Card 2',
      price: 59.99,
      description: 'Test Description 2',
      image: '/test-image-2.jpg',
      category: 'Resume'
    }
  ];

  it('renders grid layout correctly', () => {
    const { container } = render(
      <CardContainer layout="grid" cards={mockCards} />
    );
    const gridContainer = container.firstChild as HTMLElement;

    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-4');
    expect(gridContainer).toHaveClass('md:grid-cols-2');

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(mockCards.length);
  });

  it('renders horizontal layout correctly', () => {
    const { container } = render(
      <CardContainer layout="horizontal" cards={mockCards} />
    );
    const flexContainer = container.firstChild as HTMLElement;

    expect(flexContainer).toHaveClass('flex');
    expect(flexContainer).toHaveClass('overflow-scroll');

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(mockCards.length);
  });

  it('renders empty container when no cards provided', () => {
    const { container } = render(<CardContainer layout="grid" cards={[]} />);
    const emptyContainer = container.firstChild as HTMLElement;

    expect(emptyContainer).toBeDefined();
    expect(screen.queryByTestId('card')).toBeNull();
  });
});
