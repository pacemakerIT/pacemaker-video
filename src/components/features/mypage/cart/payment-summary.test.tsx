import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { CartItem } from '@/types/my-card';
import PaymentSummary from './payment-summary';

const mocks = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastErrorMock,
    success: mocks.toastSuccessMock
  }
}));

const cartItems: CartItem[] = [
  {
    id: 'cart-1',
    itemId: '11111111-1111-4111-8111-111111111111',
    title: 'Checkout Course',
    category: 'INTERVIEW',
    price: 49.99,
    type: 'COURSE',
    selected: true
  },
  {
    id: 'cart-2',
    itemId: '22222222-2222-4222-8222-222222222222',
    title: 'Unselected Ebook',
    category: 'MARKETING',
    price: 12.5,
    type: 'EBOOK',
    selected: false
  }
];

describe('PaymentSummary', () => {
  const locationAssignMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        assign: locationAssignMock
      }
    });
  });

  it('starts Stripe checkout with selected cart items only', async () => {
    (fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        checkoutUrl: 'https://checkout.stripe.test/session'
      })
    });

    render(<PaymentSummary cartItems={cartItems} />);

    fireEvent.click(screen.getAllByRole('button', { name: '결제하기' })[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/stripe/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            selectedItems: [
              {
                itemId: '11111111-1111-4111-8111-111111111111',
                itemType: 'COURSE'
              }
            ]
          })
        })
      );
    });
    expect(locationAssignMock).toHaveBeenCalledWith(
      'https://checkout.stripe.test/session'
    );
  });

  it('disables checkout when no cart items are selected', () => {
    render(
      <PaymentSummary
        cartItems={cartItems.map((item) => ({ ...item, selected: false }))}
      />
    );

    expect(
      screen.getAllByRole('button', { name: '결제하기' })[0]
    ).toBeDisabled();
  });

  it('shows CAD amounts and promotion controls', () => {
    render(<PaymentSummary cartItems={cartItems} />);

    expect(screen.getAllByText('CA$49.99').length).toBeGreaterThan(0);
    expect(
      screen.getAllByPlaceholderText('프로모션 코드 입력').length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: '등록' }).length
    ).toBeGreaterThan(0);
  });

  it('validates and submits applied promotion codes', async () => {
    (fetch as unknown as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          promotionCode: {
            code: 'SAVE10'
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          checkoutUrl: 'https://checkout.stripe.test/session'
        })
      });

    render(<PaymentSummary cartItems={cartItems} />);

    fireEvent.change(screen.getAllByPlaceholderText('프로모션 코드 입력')[0], {
      target: { value: 'SAVE10' }
    });
    fireEvent.click(screen.getAllByRole('button', { name: '등록' })[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        '/api/stripe/validate-promotion-code',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            selectedItems: [
              {
                itemId: '11111111-1111-4111-8111-111111111111',
                itemType: 'COURSE'
              }
            ],
            promotionCode: 'SAVE10'
          })
        })
      );
    });
    expect(await screen.findAllByText('적용된 코드: SAVE10')).toHaveLength(1);
    expect(mocks.toastSuccessMock).toHaveBeenCalledWith(
      '프로모션 코드가 적용되었습니다.'
    );

    fireEvent.click(screen.getAllByRole('button', { name: '결제하기' })[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        '/api/stripe/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            selectedItems: [
              {
                itemId: '11111111-1111-4111-8111-111111111111',
                itemType: 'COURSE'
              }
            ],
            promotionCode: 'SAVE10'
          })
        })
      );
    });
    expect(locationAssignMock).toHaveBeenCalledWith(
      'https://checkout.stripe.test/session'
    );
  });

  it('requires typed promotion codes to be registered before checkout', () => {
    render(<PaymentSummary cartItems={cartItems} />);

    fireEvent.change(screen.getAllByPlaceholderText('프로모션 코드 입력')[0], {
      target: { value: 'SAVE10' }
    });
    fireEvent.click(screen.getAllByRole('button', { name: '결제하기' })[0]);

    expect(mocks.toastErrorMock).toHaveBeenCalledWith(
      '프로모션 코드를 먼저 등록해주세요.'
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(locationAssignMock).not.toHaveBeenCalled();
  });

  it('shows API errors without redirecting', async () => {
    (fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Already purchased: Checkout Course'
      })
    });

    render(<PaymentSummary cartItems={cartItems} />);

    fireEvent.click(screen.getAllByRole('button', { name: '결제하기' })[0]);

    expect(
      await screen.findAllByText('Already purchased: Checkout Course')
    ).toHaveLength(2);
    expect(mocks.toastErrorMock).toHaveBeenCalledWith(
      'Already purchased: Checkout Course'
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
  });
});
