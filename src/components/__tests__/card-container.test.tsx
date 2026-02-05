// src/components/__tests__/CardContainer.test.tsx
import { describe, it, expect } from 'vitest';
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
      summary: 'Test Description 1',
      price: 49.99,
      category: 'INTERVIEW',
      uploadDate: new Date(),
      itemId: 'video1',
      watchedVideos: undefined,
      purchasedVideos: undefined
    },
    {
      id: '2',
      title: 'Test Card 2',
      summary: 'Test Description 2',
      price: 59.99,
      category: 'RESUME',
      uploadDate: new Date(),
      itemId: 'video2',
      watchedVideos: undefined,
      purchasedVideos: undefined
    },
    {
      id: '3',
      title: 'Test Card 3',
      summary: 'Test Description 3',
      price: 69.99,
      category: 'NETWORKING',
      uploadDate: new Date(),
      itemId: 'video3',
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

    // 다음 버튼이 보여야 함 (ChevronRight 아이콘을 포함한 버튼)
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveClass('md:right-[calc(100%-1225px)]');
  });

  it('shows/hides navigation buttons based on current index', () => {
    const { rerender } = render(
      <CardContainer layout="horizontal" cards={mockCards} />
    );

    // 초기 상태에서는 이전 버튼이 없고 다음 버튼이 있어야 함
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();

    // 카드가 1개만 있을 때는 다음 버튼이 없어야 함 (currentIndex < 1 - 1 = 0이므로)
    rerender(<CardContainer layout="horizontal" cards={[mockCards[0]]} />);

    // 카드가 1개일 때는 다음 버튼이 없어야 함
    expect(screen.queryByRole('button', { name: /next/i })).toBeNull();
  });

  it('handles navigation button clicks correctly', () => {
    render(<CardContainer layout="horizontal" cards={mockCards} />);

    const nextButton = screen.getByRole('button', { name: /next/i });

    fireEvent.click(nextButton);

    // 다음 버튼 클릭 후 이전 버튼이 나타나야 함 (currentIndex > 0이므로)
    expect(
      screen.getByRole('button', { name: /previous/i })
    ).toBeInTheDocument();
  });

  it('renders empty container when no cards provided', () => {
    render(<CardContainer layout="grid" cards={[]} />);
    const cards = screen.queryAllByTestId('card');
    expect(cards).toHaveLength(0);
  });
});
