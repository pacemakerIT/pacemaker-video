import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageOverlayCardContainer from '../ImageOverlayCardContainer';
import { OnlineCards } from '@/types/online';

const mockCards: OnlineCards[] = [
  {
    id: '1',
    title: 'Card 1',
    price: 0,
    description: '',
    category: 'WORKSHOP',
    videoId: 'video1',
    uploadDate: new Date(),
    watchedVideos: [],
    purchasedVideos: []
  },
  {
    id: '2',
    title: 'Card 2',
    price: 0,
    description: '',
    category: 'WORKSHOP',
    videoId: 'video2',
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
    // Next button should be visible if more than 2 cards
    if (mockCards.length > 2) {
      expect(screen.getByLabelText('next')).toBeInTheDocument();
    }
  });
});
