import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderStatus } from '@prisma/client';
import type Stripe from 'stripe';

const orderId = '22222222-2222-4222-8222-222222222222';

const tx = {
  $queryRaw: vi.fn(),
  order: {
    findUniqueOrThrow: vi.fn(),
    update: vi.fn()
  },
  userWorkshop: {
    deleteMany: vi.fn()
  }
};

const prismaMock = {
  order: {
    findUnique: vi.fn()
  },
  $transaction: vi.fn()
};

vi.mock('../prisma', () => ({
  default: prismaMock
}));

const { refundOrderForCharge } = await import('../stripe-refunds');

const sessionsListMock = vi.fn();

function stripeMock() {
  return {
    checkout: {
      sessions: {
        list: sessionsListMock
      }
    }
  } as unknown as Stripe;
}

function charge(overrides: Partial<Stripe.Charge> = {}): Stripe.Charge {
  return {
    id: 'ch_test_123',
    payment_intent: 'pi_test_123',
    amount: 8500,
    amount_refunded: 8500,
    refunded: true,
    ...overrides
  } as Stripe.Charge;
}

function completedOrder() {
  return {
    id: orderId,
    status: OrderStatus.COMPLETED,
    stripePaymentIntentId: 'pi_test_123'
  };
}

describe('refundOrderForCharge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(tx)
    );
    prismaMock.order.findUnique.mockResolvedValue({ id: orderId });
    tx.order.findUniqueOrThrow.mockResolvedValue(completedOrder());
    tx.$queryRaw.mockResolvedValue([{ status: OrderStatus.COMPLETED }]);
    tx.order.update.mockResolvedValue({});
    tx.userWorkshop.deleteMany.mockResolvedValue({ count: 1 });
    sessionsListMock.mockResolvedValue({ data: [] });
  });

  it('marks a fully refunded order as refunded and revokes workshop seats', async () => {
    const result = await refundOrderForCharge(stripeMock(), charge());

    expect(result).toEqual({ orderId, status: 'refunded' });
    expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
      where: { stripePaymentIntentId: 'pi_test_123' },
      select: { id: true }
    });
    expect(tx.userWorkshop.deleteMany).toHaveBeenCalledWith({
      where: { orderId }
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUNDED,
        stripePaymentIntentId: 'pi_test_123'
      }
    });
    expect(sessionsListMock).not.toHaveBeenCalled();
  });

  it('does not repeat side effects when the refund event is retried', async () => {
    tx.order.findUniqueOrThrow.mockResolvedValue({
      ...completedOrder(),
      status: OrderStatus.REFUNDED
    });

    const result = await refundOrderForCharge(stripeMock(), charge());

    expect(result).toEqual({ orderId, status: 'already_refunded' });
    expect(tx.userWorkshop.deleteMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('keeps access for partial refunds', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    try {
      const result = await refundOrderForCharge(
        stripeMock(),
        charge({ refunded: false, amount_refunded: 1000 })
      );

      expect(result).toEqual({ orderId, status: 'partial_refund_ignored' });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[STRIPE] Partial refund left order access unchanged',
        {
          orderId,
          chargeId: 'ch_test_123',
          amount: 8500,
          amountRefunded: 1000
        }
      );
    } finally {
      consoleWarnSpy.mockRestore();
    }
  });

  it('finds the order through the checkout session before fulfillment stored the payment intent', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    sessionsListMock.mockResolvedValue({
      data: [{ id: 'cs_test_123', metadata: { orderId } }]
    });
    tx.order.findUniqueOrThrow.mockResolvedValue({
      ...completedOrder(),
      status: OrderStatus.PENDING,
      stripePaymentIntentId: null
    });

    const result = await refundOrderForCharge(stripeMock(), charge());

    expect(result).toEqual({ orderId, status: 'refunded' });
    expect(sessionsListMock).toHaveBeenCalledWith({
      payment_intent: 'pi_test_123',
      limit: 1
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUNDED,
        stripePaymentIntentId: 'pi_test_123'
      }
    });
  });

  it('ignores charges that do not belong to an app order', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    const result = await refundOrderForCharge(stripeMock(), charge());

    expect(result).toEqual({ orderId: null, status: 'ignored' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('ignores charges without a payment intent', async () => {
    const result = await refundOrderForCharge(
      stripeMock(),
      charge({ payment_intent: null })
    );

    expect(result).toEqual({ orderId: null, status: 'ignored' });
    expect(prismaMock.order.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a session match whose order has a different payment intent', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    sessionsListMock.mockResolvedValue({
      data: [{ id: 'cs_test_123', client_reference_id: orderId }]
    });
    tx.order.findUniqueOrThrow.mockResolvedValue({
      ...completedOrder(),
      stripePaymentIntentId: 'pi_other'
    });

    await expect(refundOrderForCharge(stripeMock(), charge())).rejects.toThrow(
      'Stripe payment intent does not match the order'
    );
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('locks the order row before reading its status', async () => {
    await refundOrderForCharge(stripeMock(), charge());

    const [sql, lockedOrderId] = tx.$queryRaw.mock.calls[0];
    expect(sql.join('?')).toContain('FOR UPDATE');
    expect(lockedOrderId).toBe(orderId);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.order.findUniqueOrThrow.mock.invocationCallOrder[0]
    );
  });

  it('ignores a session order id that matches no order row', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    sessionsListMock.mockResolvedValue({
      data: [{ id: 'cs_test_123', metadata: { orderId } }]
    });
    tx.$queryRaw.mockResolvedValue([]);

    const result = await refundOrderForCharge(stripeMock(), charge());

    expect(result).toEqual({ orderId: null, status: 'ignored' });
    expect(tx.order.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('ignores sessions from other integrations whose order id is not a UUID', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    sessionsListMock.mockResolvedValue({
      data: [
        {
          id: 'cs_foreign',
          metadata: { orderId: 'INV-2026-0042' },
          client_reference_id: 'customer-77'
        }
      ]
    });

    const result = await refundOrderForCharge(stripeMock(), charge());

    expect(result).toEqual({ orderId: null, status: 'ignored' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('uses client_reference_id when metadata.orderId is not a UUID', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    sessionsListMock.mockResolvedValue({
      data: [
        {
          id: 'cs_test_123',
          metadata: { orderId: 'INV-2026-0042' },
          client_reference_id: orderId
        }
      ]
    });

    const result = await refundOrderForCharge(stripeMock(), charge());

    expect(result).toEqual({ orderId, status: 'refunded' });
    expect(tx.$queryRaw.mock.calls[0][1]).toBe(orderId);
  });
});
