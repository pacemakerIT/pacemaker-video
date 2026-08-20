import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WorkshopList from '../features/workshops/workshop-list-horz';
import { ItemType } from '@prisma/client';

const mockWorkshops = [
  {
    id: '1',
    title: '워크샵 1',
    price: 0,
    description: '설명',
    category: ItemType.WORKSHOP,
    videoId: 'video1',
    uploadDate: new Date(),
    watchedVideos: [],
    purchasedVideos: []
  }
];

describe('WorkshopList', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWorkshops)
        })
      )
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading text and then workshop list', async () => {
    render(<WorkshopList />);
    expect(screen.getByText('📡 Loading workshops...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('페이스메이커 워크샵')).toBeInTheDocument();
      expect(screen.getByText('워크샵 1')).toBeInTheDocument();
    });
  });
});
