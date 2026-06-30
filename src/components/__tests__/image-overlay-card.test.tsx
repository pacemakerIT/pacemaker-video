import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageOverlayCard from '../image-overlay-card';
import { OnlineCards } from '@/types/online';
import { ItemType } from '@prisma/client';

const mockCard: OnlineCards = {
  id: '1',
  visualTitle2: 'Card 1',
  price: 0,
  description: '',
  category: ItemType.WORKSHOP,
  itemId: 'video1',
  isPublic: true,
  showOnMain: true,
  uploadDate: new Date(),
  watchedVideos: [],
  purchasedVideos: [],
  status: 'RECRUITING'
};

describe('ImageOverlayCard', () => {
  it('renders overlay card content', () => {
    render(<ImageOverlayCard {...mockCard} />);
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
    expect(screen.getByTestId('card-image')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toHaveClass('text-navy');
  });

  it('toggles like state when heart button is clicked', () => {
    render(<ImageOverlayCard {...mockCard} />);
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    expect(likeButton.querySelector('svg')).toHaveClass('fill-orange');
  });

  it('uses orange for ongoing workshops and gray for ended workshops', () => {
    const { rerender } = render(
      <ImageOverlayCard {...mockCard} status="ONGOING" />
    );
    expect(screen.getByText('Ongoing')).toHaveClass('text-orange');

    rerender(<ImageOverlayCard {...mockCard} status="COMPLETED" />);
    expect(screen.getByText('Ended')).toHaveClass('text-slate-400');
  });
});
