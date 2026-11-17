import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EbookListGrid from './ebook-list-grid';

vi.mock('@/components/common/card-container', () => ({
  default: ({ cards }: { cards: unknown[] }) => (
    <div data-testid="card-container">{cards.length}</div>
  )
}));

describe('EbookListGrid', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => []
      })
    );
  });

  it('includes Service in the category filters', async () => {
    render(<EbookListGrid />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Service' })
      ).toBeInTheDocument();
    });
  });
});
