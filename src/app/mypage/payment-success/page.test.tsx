import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrderDisplay } from '@/lib/order-display';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  user: vi.fn(),
  order: vi.fn()
}));
vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
  default: { user: { findUnique: mocks.user } }
}));
vi.mock('@/lib/order-display', () => ({
  getOrderDisplayBySessionId: mocks.order
}));

import PaymentSuccess from './page';

const order: OrderDisplay = {
  id: 'order-1',
  orderNumber: 'No. ABC123',
  status: 'COMPLETED',
  statusLabel: '결제완료',
  orderedAt: new Date('2026-09-01'),
  currency: 'cad',
  subtotalAmountCents: 5600,
  discountAmountCents: 600,
  taxAmountCents: 0,
  totalAmountCents: 5000,
  stripeCheckoutSessionId: 'session-1',
  stripeReceiptUrl: null,
  stripeInvoiceUrl: null,
  items: [
    {
      id: 'item-1',
      itemId: 'ebook-1',
      itemType: 'EBOOK',
      typeLabel: '전자책',
      title: 'Interview guide',
      category: 'INTERVIEW',
      thumbnail: '/img/ebook_image1.png',
      startsAt: null,
      priceCents: 2800,
      quantity: 2,
      actionHref: '/ebooks/ebook-1',
      actionLabel: '전자책 보기'
    }
  ]
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ userId: 'clerk-1' });
  mocks.user.mockResolvedValue({ id: 'user-1' });
  mocks.order.mockResolvedValue(order);
});
afterEach(cleanup);

async function renderPage(session_id?: string | string[]) {
  render(
    await PaymentSuccess({ searchParams: Promise.resolve({ session_id }) })
  );
}

describe('Payment success', () => {
  it('looks up the session for the signed-in user and renders actual totals and item destinations', async () => {
    await renderPage(['session-1', 'ignored']);
    expect(mocks.order).toHaveBeenCalledWith('session-1', 'user-1');
    expect(
      screen.getByRole('heading', { name: 'Payment Complete' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Total paid:/)).toHaveTextContent('50.00');
    expect(screen.getByText(/Quantity:/)).toHaveTextContent('2');
    expect(screen.getByText(/56.00/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read e-book' })).toHaveAttribute(
      'href',
      '/ebooks/ebook-1'
    );
    expect(
      screen.getByRole('link', { name: 'View my courses' })
    ).toHaveAttribute('href', '/mypage');
  });

  it.each([
    ['PENDING', 'Payment confirmation pending'],
    ['FAILED', 'Payment unsuccessful'],
    ['CANCELLED', 'Payment cancelled'],
    ['REFUNDED', 'Payment refunded']
  ] as const)(
    'does not claim payment completion for %s orders',
    async (status, title) => {
      mocks.order.mockResolvedValue({ ...order, status });
      await renderPage('session-1');
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(
        screen.queryByText('Total paid', { exact: false })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Read e-book' })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Back to cart' })
      ).toHaveAttribute('href', '/mypage/cart');
    }
  );

  it('shows an empty state without querying orders when no session is supplied', async () => {
    await renderPage();
    expect(mocks.order).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'Payment information unavailable' })
    ).toBeInTheDocument();
  });

  it('does not query order data for a signed-out visitor', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    await renderPage('session-1');
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.order).not.toHaveBeenCalled();
  });

  it('shows no purchased items when the session is not accessible to the account', async () => {
    mocks.order.mockResolvedValue(null);
    await renderPage('someone-elses-session');
    expect(
      screen.queryByRole('list', { name: 'Purchased items' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View order history' })
    ).toBeInTheDocument();
  });
});
