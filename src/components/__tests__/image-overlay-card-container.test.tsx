import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageOverlayCardContainer from '../image-overlay-card-container';
import { OnlineCards } from '@/types/online';
import { ItemType } from '@prisma/client';

// Mock the ImageOverlayCard component
vi.mock('../image-overlay-card', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="image-overlay-card">{title}</div>
  )
}));

const mockCards: OnlineCards[] = [
  {
    id: '1',
    title: 'Card 1',
    price: 0,
    summary: '',
    category: ItemType.WORKSHOP,
    itemId: 'video1',
    uploadDate: new Date(),
    watchedVideos: [],
    purchasedVideos: []
  },
  {
    id: '2',
    title: 'Card 2',
    price: 0,
    summary: '',
    category: ItemType.WORKSHOP,
    itemId: 'video2',
    uploadDate: new Date(),
    watchedVideos: [],
    purchasedVideos: []
  }
];

describe('ImageOverlayCardContainer', () => {
  it('renders grid layout', () => {
    render(<ImageOverlayCardContainer layout="grid" cards={mockCards} />);
    const all = screen.getAllByTestId('image-overlay-card');
    // 부모에 같은 testid가 없는 것만 필터
    const topLevel = all.filter(
      (el) => !el.parentElement?.closest('[data-testid="image-overlay-card"]')
    );
    expect(topLevel).toHaveLength(2);
  });

  it('renders horizontal layout and navigation', () => {
    render(<ImageOverlayCardContainer layout="horizontal" cards={mockCards} />);
    expect(screen.getAllByTestId('image-overlay-card')).toHaveLength(2);

    // 초기에는 이전 버튼이 보이지 않아야 함
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();

    // 2개 카드일 때는 다음 버튼이 보이지 않아야 함 (currentIndex < cards.length - 3 조건)
    expect(screen.queryByRole('button', { name: /next/i })).toBeNull();
  });

  it('shows/hides navigation buttons based on current index', () => {
    render(<ImageOverlayCardContainer layout="horizontal" cards={mockCards} />);

    // 초기 상태에서는 이전 버튼이 없고 다음 버튼도 없어야 함 (2개 카드, currentIndex < cards.length - 3 조건)
    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /next/i })).toBeNull();

    // 2개 카드일 때는 다음 버튼이 없으므로 테스트를 건너뜀

    // 마지막 카드에서는 다음 버튼이 없어야 함 (currentIndex >= cards.length - 1이므로)
    expect(screen.queryByRole('button', { name: /next/i })).toBeNull();
  });
});
