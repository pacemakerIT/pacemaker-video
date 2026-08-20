import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PurchaseProvider, usePurchase } from '@/app/context/purchase-context';

const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  useAuth: vi.fn()
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: mocks.useAuth
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError
  }
}));

function PurchaseStatusActions() {
  const { checkPurchaseStatus, isPurchased } = usePurchase();

  return (
    <>
      <output data-testid="purchase-status">{String(isPurchased)}</output>
      <button onClick={() => checkPurchaseStatus('video123')}>
        Check video
      </button>
      <button onClick={() => checkPurchaseStatus('invalid-video')}>
        Check invalid video
      </button>
    </>
  );
}

describe('PurchaseProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      userId: 'user_123',
      isLoaded: true
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('does not fetch purchase status just because the provider mounts', () => {
    render(
      <PurchaseProvider>
        <PurchaseStatusActions />
      </PurchaseProvider>
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('checks the explicitly requested valid video ID', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ purchasedVideoIds: ['video123'] })
    } as unknown as Response);

    render(
      <PurchaseProvider>
        <PurchaseStatusActions />
      </PurchaseProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Check video' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/purchase-video-status?clerkId=user_123'
      );
      expect(screen.getByTestId('purchase-status')).toHaveTextContent('true');
    });
  });

  it('does not fetch when a valid video ID is requested before authentication is available', () => {
    mocks.useAuth.mockReturnValue({
      userId: null,
      isLoaded: false
    });

    render(
      <PurchaseProvider>
        <PurchaseStatusActions />
      </PurchaseProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Check video' }));

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByTestId('purchase-status')).toHaveTextContent('false');
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('rejects an explicitly requested invalid video ID without fetching', () => {
    render(
      <PurchaseProvider>
        <PurchaseStatusActions />
      </PurchaseProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Check invalid video' })
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith('Invalid video ID format');
  });

  it('reports a failed explicit purchase status check', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network down'));

    render(
      <PurchaseProvider>
        <PurchaseStatusActions />
      </PurchaseProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Check video' }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'Purchase check failed: network down'
      );
    });
    expect(screen.getByTestId('purchase-status')).toHaveTextContent('false');
  });
});
