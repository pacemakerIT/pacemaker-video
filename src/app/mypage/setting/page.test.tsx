import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import SettingsPage from './page';

const mocks = vi.hoisted(() => ({
  updateUser: vi.fn(),
  fetch: vi.fn(),
  error: vi.fn(),
  router: { push: vi.fn() },
  user: {
    nickname: 'Before',
    email: 'test@example.com',
    createdAt: '2026-01-01'
  }
}));
vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }));
vi.mock('@/app/context/user-context', () => ({
  useUserContext: () => ({
    user: mocks.user,
    updateUser: mocks.updateUser,
    isLoading: false
  }),
  getUserDisplayName: () => mocks.user.nickname
}));
vi.mock('@/components/features/mypage/setting/update-password-form', () => ({
  default: () => null
}));
vi.mock('@/components/features/mypage/setting/update-profile-photo', () => ({
  default: () => null
}));
vi.mock('sonner', () => ({
  toast: { error: mocks.error, success: vi.fn(), info: vi.fn() }
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ interest: [] })
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('saves the trimmed nickname and updates the shared account state', async () => {
  render(<SettingsPage />);
  await waitFor(() =>
    expect(mocks.fetch).toHaveBeenCalledWith('/api/interest')
  );
  mocks.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ...mocks.user, nickname: 'After' })
  });
  fireEvent.change(screen.getByLabelText('Nickname'), {
    target: { value: ' After ' }
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'Save changes' })[0]);
  await waitFor(() =>
    expect(mocks.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ nickname: 'After' })
    )
  );
  expect(mocks.fetch).toHaveBeenCalledWith(
    '/api/user',
    expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ nickname: 'After' })
    })
  );
});

it('shows the server error when saving a nickname fails', async () => {
  render(<SettingsPage />);
  await waitFor(() =>
    expect(mocks.fetch).toHaveBeenCalledWith('/api/interest')
  );
  mocks.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: 'Unable to save your nickname.' })
  });
  fireEvent.change(screen.getByLabelText('Nickname'), {
    target: { value: 'After' }
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'Save changes' })[0]);
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to save your nickname.'
  );
  expect(mocks.updateUser).not.toHaveBeenCalled();
});

it('keeps an unsaved nickname when account data refreshes without a nickname change', async () => {
  const { rerender } = render(<SettingsPage />);
  fireEvent.change(screen.getByLabelText('Nickname'), {
    target: { value: 'Unsaved nickname' }
  });
  mocks.user = { ...mocks.user };
  rerender(<SettingsPage />);
  expect(screen.getByLabelText('Nickname')).toHaveValue('Unsaved nickname');
});
