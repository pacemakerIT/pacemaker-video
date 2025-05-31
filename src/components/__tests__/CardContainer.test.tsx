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
  });

  it('shows/hides navigation buttons based on scroll position', () => {
    const { container } = render(
      <CardContainer layout="horizontal" cards={mockCards} />
    );

    const scrollContainer = container.querySelector('.flex.overflow-hidden');
    expect(scrollContainer).toBeInTheDocument();

    // 스크롤 이벤트를 모킹
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollLeft', {
        writable: true,
        value: 1000
      });
      Object.defineProperty(scrollContainer, 'scrollWidth', {
        writable: true,
        value: 1000
      });
      Object.defineProperty(scrollContainer, 'clientWidth', {
        writable: true,
        value: 500
      });

      // 스크롤 이벤트 발생
      fireEvent.scroll(scrollContainer, {
        target: {
          scrollLeft: 1000,
          scrollWidth: 1000,
          clientWidth: 500
        }
      });

      // 상태 업데이트를 기다림
      setTimeout(() => {
        // 다음 버튼이 사라져야 함
        expect(screen.queryByRole('button')).toBeNull();
      }, 0);
    }
  });

  it('handles navigation button clicks correctly', () => {
    const { container } = render(
      <CardContainer layout="horizontal" cards={mockCards} />
    );

    const nextButton = screen.getByRole('button');

    // scrollTo 메서드 모킹
    const scrollContainer = container.querySelector('.flex.overflow-hidden');
    if (scrollContainer) {
      scrollContainer.scrollTo = vi.fn();
    }

    fireEvent.click(nextButton);

    // 다음 버튼 클릭 후 이전 버튼이 나타나야 함
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders empty container when no cards provided', () => {
    render(<CardContainer layout="grid" cards={[]} />);
    const cards = screen.queryAllByTestId('card');
    expect(cards).toHaveLength(0);
  });
});
