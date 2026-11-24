import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { OrderStatus } from '@prisma/client';
import PurchasesList from './purchases-list';

afterEach(cleanup);

const items = Array.from({ length: 4 }, (_, index) => ({
  id: String(index),
  type: 'E-book',
  title: `Book ${index + 1}`,
  priceCents: 1000,
  quantity: 1
}));
const props = {
  orderNumber: 'No. 123',
  items,
  amountCents: 4000,
  status: 'COMPLETED' as OrderStatus,
  statusLabel: 'Paid',
  date: '2026-11-22',
  currency: 'cad',
  payment: {
    subtotalCents: 4000,
    discountCents: 0,
    taxCents: 0,
    totalCents: 4000,
    currency: 'cad',
    method: 'Credit card',
    installment: 'One-time payment',
    card: '-'
  },
  receiptUrl: null
};

describe('Order history', () => {
  it('counts and expands only additional items', () => {
    render(<PurchasesList {...props} />);
    const more = screen.getByRole('button', { name: '3 items More' });
    fireEvent.click(more);
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).queryByText(/Book 1/)).not.toBeInTheDocument();
    expect(more).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(more);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('does not offer expansion for a single item', () => {
    render(<PurchasesList {...props} items={items.slice(0, 1)} />);
    expect(
      screen.queryByRole('button', { name: /More/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Book 1')).toBeInTheDocument();
  });

  it.each([
    ['REFUNDED', 'Refunded', 'This order has been refunded.'],
    [
      'REFUND_PROCESSING',
      'Refund processing',
      'A refund for this order is being processed.'
    ]
  ] as const)(
    'shows %s in details and prevents another refund request',
    (status, statusLabel, message) => {
      render(
        <PurchasesList {...props} status={status} statusLabel={statusLabel} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'View details' }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(statusLabel)).toBeInTheDocument();
      expect(
        within(dialog).getByRole('region', { name: 'Refund details' })
      ).toHaveTextContent(message);
      expect(
        within(dialog).queryByRole('button', { name: 'Request refund' })
      ).not.toBeInTheDocument();
      expect(within(dialog).getByText('Total paid')).toBeInTheDocument();
    }
  );

  it('continues to offer refund instructions for a paid order', () => {
    render(<PurchasesList {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'View details' }));
    fireEvent.click(screen.getByRole('button', { name: 'Request refund' }));
    expect(
      screen.getByText(/To request a refund, please send an email/)
    ).toBeInTheDocument();
  });
});
