import { beforeEach, describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';

const constructEventMock = vi.fn();
const fulfillCheckoutSessionMock = vi.fn();
const refundOrderForChargeMock = vi.fn();
const stripeClientMock = {
  webhooks: {
    constructEvent: constructEventMock
  }
};

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(() => stripeClientMock)
}));

vi.mock('@/lib/stripe-fulfillment', () => ({
  fulfillCheckoutSession: fulfillCheckoutSessionMock
}));

vi.mock('@/lib/stripe-refunds', () => ({
  refundOrderForCharge: refundOrderForChargeMock
}));

const { POST } = await import('./route');

function chargeRefundedEvent() {
  return {
    id: 'evt_refund_123',
    type: 'charge.refunded',
    data: {
      object: {
        id: 'ch_test_123',
        payment_intent: 'pi_test_123'
      }
    }
  } as unknown as Stripe.Event;
}

function request(headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers,
    body: '{"id":"evt_test_123"}'
  });
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
    fulfillCheckoutSessionMock.mockResolvedValue({
      orderId: 'order-123',
      status: 'completed'
    });
    refundOrderForChargeMock.mockResolvedValue({
      orderId: 'order-123',
      status: 'refunded'
    });
    constructEventMock.mockReturnValue({
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123'
        }
      }
    } as unknown as Stripe.Event);
  });

  it('rejects requests without a Stripe signature', async () => {
    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Missing Stripe signature'
    });
    expect(constructEventMock).not.toHaveBeenCalled();
    expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it('verifies the webhook event and fulfills checkout sessions', async () => {
    const response = await POST(
      request({ 'stripe-signature': 'valid-signature' })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      received: true,
      fulfillment: {
        orderId: 'order-123',
        status: 'completed'
      }
    });
    expect(constructEventMock).toHaveBeenCalledWith(
      '{"id":"evt_test_123"}',
      'valid-signature',
      'whsec_test_123'
    );
    expect(fulfillCheckoutSessionMock).toHaveBeenCalledWith(stripeClientMock, {
      id: 'cs_test_123'
    });
  });

  it('rejects invalid Stripe signatures', async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const response = await POST(
      request({ 'stripe-signature': 'bad-signature' })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Invalid signature'
    });
    expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it('logs configuration failures before signature verification', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      const response = await POST(
        request({ 'stripe-signature': 'valid-signature' })
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Missing STRIPE_WEBHOOK_SECRET configuration'
      });
      expect(constructEventMock).not.toHaveBeenCalled();
      expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[API ERROR] POST /api/stripe/webhook: configuration failed',
        {
          error: expect.any(Error)
        }
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('logs fulfillment failures before returning a server error', async () => {
    const error = new Error('Fulfillment failed');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    fulfillCheckoutSessionMock.mockRejectedValue(error);

    try {
      const response = await POST(
        request({ 'stripe-signature': 'valid-signature' })
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Fulfillment failed'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[API ERROR] POST /api/stripe/webhook: fulfillment failed',
        {
          eventId: 'evt_test_123',
          eventType: 'checkout.session.completed',
          error
        }
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('revokes the order for refunded charges', async () => {
    constructEventMock.mockReturnValue(chargeRefundedEvent());

    const response = await POST(
      request({ 'stripe-signature': 'valid-signature' })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      received: true,
      refund: {
        orderId: 'order-123',
        status: 'refunded'
      }
    });
    expect(refundOrderForChargeMock).toHaveBeenCalledWith(stripeClientMock, {
      id: 'ch_test_123',
      payment_intent: 'pi_test_123'
    });
    expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it('logs refund failures so Stripe retries the event', async () => {
    const error = new Error('Refund failed');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    constructEventMock.mockReturnValue(chargeRefundedEvent());
    refundOrderForChargeMock.mockRejectedValue(error);

    try {
      const response = await POST(
        request({ 'stripe-signature': 'valid-signature' })
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Refund failed'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[API ERROR] POST /api/stripe/webhook: refund failed',
        {
          eventId: 'evt_refund_123',
          eventType: 'charge.refunded',
          error
        }
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
