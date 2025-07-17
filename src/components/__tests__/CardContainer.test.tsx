// src/components/__tests__/CardContainer.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnlineCards } from '@/types/online';
import CardContainer from '../common/card-container';

// Mock the Card component
vi.mock('../common/card', () => ({
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

    // Check if container has correct classes
    const container = screen.getByRole('button').closest('div');
    expect(container).toHaveClass('relative', 'w-full');

    // Check if scroll container has correct classes
    const scrollContainer = container?.querySelector(
      'div[class*="flex gap-4"]'
    );
    expect(scrollContainer).toHaveClass(
      'flex',
      'gap-4',
      'pb-4',
      'w-[calc(100vw-360px)]',
      'overflow-hidden'
    );

    // Initially, prev button should not be visible
    expect(screen.queryByRole('button')).toBeInTheDocument();

    // 다음 버튼이 보여야 함 (ChevronRight 아이콘을 포함한 버튼)
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveClass('md:right-[calc(100%-1210px)]');
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

    // 초기 상태에서는 이전 버튼이 없고 다음 버튼이 있어야 함
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();

    // 다음 버튼 클릭
    fireEvent.click(buttons[0]);

    // 마지막 카드에서는 다음 버튼이 없어야 함
    expect(screen.queryByRole('button', { name: /next/i })).toBeNull();
  });

  it('handles navigation button clicks correctly', () => {
    render(<CardContainer layout="horizontal" cards={mockCards} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    const scrollContainer = container.querySelector('.flex.overflow-hidden');

    // Click next button
    fireEvent.click(nextButton);

    // 다음 버튼 클릭 후 이전 버튼이 나타나야 함
    expect(
      screen.getByRole('button', { name: /previous/i })
    ).toBeInTheDocument();
    expect(scrollContainer?.scrollTo).toHaveBeenCalled();
  });

  it('renders empty container when no cards provided', () => {
    render(<CardContainer layout="grid" cards={[]} />);
    const cards = screen.queryAllByTestId('card');
    expect(cards).toHaveLength(0);
  });
});
