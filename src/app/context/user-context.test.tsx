import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { UserProvider, useUserContext } from './user-context';

const mocks = vi.hoisted(() => ({
  clerkUser: {
    id: 'clerk-1',
    hasImage: true,
    imageUrl: 'https://img.clerk.com/old'
  }
}));
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: true, user: mocks.clerkUser })
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Profile() {
  const { user } = useUserContext();
  return <p>{user?.image}</p>;
}

it('reflects Clerk profile image changes without waiting for a webhook or reloading', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clerkId: 'clerk-1', image: null })
    })
  );
  const { rerender } = render(
    <UserProvider>
      <Profile />
    </UserProvider>
  );
  expect(
    await screen.findByText('https://img.clerk.com/old')
  ).toBeInTheDocument();
  mocks.clerkUser = {
    ...mocks.clerkUser,
    imageUrl: 'https://img.clerk.com/new'
  };
  rerender(
    <UserProvider>
      <Profile />
    </UserProvider>
  );
  expect(
    await screen.findByText('https://img.clerk.com/new')
  ).toBeInTheDocument();
});
