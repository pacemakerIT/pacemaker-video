import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType } from '@prisma/client';
import WorkshopsClient from './workshops-client';

const mocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
  favorites: [] as { itemId: string; itemType: string }[],
  push: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  error: vi.fn(),
  scroll: vi.fn()
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/app/context/user-context', () => ({
  useUserContext: () => ({ user: mocks.user })
}));
vi.mock('@/app/context/favorite-context', () => ({
  useFavoriteContext: () => mocks
}));
vi.mock('sonner', () => ({ toast: { error: mocks.error } }));
vi.mock('@/components/features/workshops/workshop-calendar', () => ({
  default: ({
    onSelectWorkshop
  }: {
    onSelectWorkshop: (title: string) => void;
  }) => (
    <button onClick={() => onSelectWorkshop('QA Workshop')}>
      Select calendar workshop
    </button>
  )
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = null;
  mocks.favorites = [];
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => ({
        workshops: [
          {
            id: 'qa-workshop',
            title: 'QA Workshop',
            description: 'Workshop description',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            price: 10,
            status: 'OPEN',
            category: 'NETWORKING',
            thumbnail: null,
            instructors: [],
            locationOrUrl: 'Online'
          }
        ]
      })
    })
  );
  vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(
    mocks.scroll
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const getCard = () =>
  screen.findByRole('link', { name: 'View details for QA Workshop' });

describe('Workshop list QA regressions', () => {
  it('shows loading separately from the empty filter result', async () => {
    render(<WorkshopsClient />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading workshops');
    await getCard();
    fireEvent.click(screen.getByRole('button', { name: 'Closed' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'No workshops found for this month and filter.'
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('reveals and scrolls to a calendar selection even when filtered out, including repeated selections', async () => {
    render(<WorkshopsClient />);
    await getCard();
    fireEvent.click(screen.getByRole('button', { name: 'Closed' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Select calendar workshop' })
    );
    await getCard();
    await waitFor(() => expect(mocks.scroll).toHaveBeenCalledTimes(1));
    fireEvent.click(
      screen.getByRole('button', { name: 'Select calendar workshop' })
    );
    await waitFor(() => expect(mocks.scroll).toHaveBeenCalledTimes(2));
  });

  it('shows a signed-out favorite warning without navigating', async () => {
    render(<WorkshopsClient />);
    const card = await getCard();
    fireEvent.click(within(card).getByRole('button', { name: 'Save' }));
    expect(mocks.error).toHaveBeenCalledWith('Please log in to use favorite.');
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.addFavorite).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'updates signed-in favorites without navigating (already saved: %s)',
    async (saved) => {
      mocks.user = { id: 'qa-user' };
      if (saved)
        mocks.favorites = [
          { itemId: 'qa-workshop', itemType: ItemType.WORKSHOP }
        ];
      render(<WorkshopsClient />);
      const card = await getCard();
      const favorite = within(card).getByRole('button', {
        name: saved ? 'Saved' : 'Save'
      });
      fireEvent.keyDown(favorite, { key: 'Enter' });
      fireEvent.click(favorite);
      expect(
        saved ? mocks.removeFavorite : mocks.addFavorite
      ).toHaveBeenCalledWith('qa-workshop', ItemType.WORKSHOP);
      expect(mocks.push).not.toHaveBeenCalled();
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mocks.push).toHaveBeenCalledWith('/workshops/qa-workshop');
    }
  );
});
