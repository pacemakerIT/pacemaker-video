import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageOverlayCard from '../image-overlay-card';
import { OnlineCards } from '@/types/online';
import { ItemType } from '@prisma/client';

const mockCard: OnlineCards = {
  id: '1',
  title: 'Card 1',
  price: 0,
  summary: '',
  category: ItemType.WORKSHOP,
  itemId: 'video1',
  uploadDate: new Date(),
  watchedVideos: [],
  purchasedVideos: []
};

describe('ImageOverlayCard', () => {
  it('renders overlay card content', () => {
    render(<ImageOverlayCard {...mockCard} />);
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
    expect(screen.getByTestId('card-image')).toBeInTheDocument();
    expect(screen.getByText('진행중')).toBeInTheDocument();
  });

  it('toggles like state when heart button is clicked', () => {
    render(<ImageOverlayCard {...mockCard} />);
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    expect(likeButton.querySelector('svg')).toHaveClass('fill-pace-orange-800');
  });
});
