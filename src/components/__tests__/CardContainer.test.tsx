// src/components/__tests__/CardContainer.test.tsx
import { describe, it, expect, vi } from 'vitest';
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

  it('renders grid layout correctly', () => {
    render(<CardContainer layout="grid" cards={mockCards} />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });

  it('renders horizontal layout with navigation buttons', () => {
    render(<CardContainer layout="horizontal" cards={mockCards} />);

    // 초기에는 이전 버튼이 보이지 않아야 함
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();

    // 다음 버튼이 보여야 함
    const nextButton = screen.getByRole('button');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveClass('right-[calc(100%-1210px)]');
  });

  it('shows/hides navigation buttons based on current index', () => {
    const { rerender } = render(
      <CardContainer layout="horizontal" cards={mockCards} />
    );

    // 초기 상태에서는 이전 버튼이 없고 다음 버튼이 있어야 함
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();
    expect(screen.getByRole('button')).toBeInTheDocument();

    // 마지막 카드로 이동한 상태를 시뮬레이션
    rerender(
      <CardContainer layout="horizontal" cards={mockCards.slice(0, 2)} />
    );

    // 마지막 카드에서는 다음 버튼이 없어야 함
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('handles navigation button clicks correctly', () => {
    const { container } = render(
      <CardContainer layout="horizontal" cards={mockCards} />
    );

    const nextButton = screen.getByRole('button');
    const scrollContainer = container.querySelector('.flex.overflow-hidden');

    if (scrollContainer) {
      scrollContainer.scrollTo = vi.fn();
    }

    fireEvent.click(nextButton);

    // 다음 버튼 클릭 후 이전 버튼이 나타나야 함
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(scrollContainer?.scrollTo).toHaveBeenCalled();
  });

  it('renders empty container when no cards provided', () => {
    render(<CardContainer layout="grid" cards={[]} />);
    const cards = screen.queryAllByTestId('card');
    expect(cards).toHaveLength(0);
  });
});
