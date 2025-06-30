// src/components/__tests__/CardContainer.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnlineCards } from '@/types/online';
import CardContainer from '../CardContainer';

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
      description: 'Test Description 1',
      price: 49.99,
      category: 'INTERVIEW',
      uploadDate: new Date(),
      videoId: 'video1',
      watchedVideos: undefined,
      purchasedVideos: undefined
    },
    {
      id: '2',
      title: 'Test Card 2',
      description: 'Test Description 2',
      price: 59.99,
      category: 'RESUME',
      uploadDate: new Date(),
      videoId: 'video2',
      watchedVideos: undefined,
      purchasedVideos: undefined
    },
    {
      id: '3',
      title: 'Test Card 3',
      description: 'Test Description 3',
      price: 69.99,
      category: 'NETWORKING',
      uploadDate: new Date(),
      videoId: 'video3',
      watchedVideos: undefined,
      purchasedVideos: undefined
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollTo
    Element.prototype.scrollTo = vi.fn();
  });

  it('renders grid layout correctly', () => {
    render(<CardContainer layout="grid" cards={mockCards} />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });

  it('renders horizontal layout with navigation buttons', () => {
    render(<CardContainer layout="horizontal" cards={mockCards} />);

    // Check if cards are rendered
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);

    // Check if container has correct classes and testid
    const container = screen.getByTestId('horizontal-container');
    expect(container).toHaveClass('relative', 'flex', 'w-screen');

    // Initially, prev button should not be visible
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();

    // Next button should be visible
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton.className).toContain('right-[330px]');
  });

  it('shows/hides navigation buttons based on current index', () => {
    const mockCardsWithMoreItems = [
      ...mockCards,
      {
        id: '4',
        title: 'Test Card 4',
        description: 'Test Description 4',
        price: 79.99,
        category: 'INTERVIEW',
        uploadDate: new Date(),
        videoId: 'video4',
        watchedVideos: undefined,
        purchasedVideos: undefined
      }
    ];

    render(
      <CardContainer layout="horizontal" cards={mockCardsWithMoreItems} />
    );

    // 초기 상태: 다음 버튼만 보여야 함
    const initialNextButton = screen.getByRole('button', { name: /next/i });
    expect(initialNextButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();

    // 다음 버튼 클릭
    fireEvent.click(initialNextButton);

    // 이제 양쪽 버튼 모두 보여야 함
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('handles navigation button clicks correctly', () => {
    render(<CardContainer layout="horizontal" cards={mockCards} />);

    const nextButton = screen.getByRole('button', { name: /next/i });

    // Click next button
    fireEvent.click(nextButton);

    // Check if scrollTo was called
    expect(Element.prototype.scrollTo).toHaveBeenCalled();
  });

  it('renders empty container when no cards provided', () => {
    render(<CardContainer layout="grid" cards={[]} />);
    const cards = screen.queryAllByTestId('card');
    expect(cards).toHaveLength(0);
  });
});
