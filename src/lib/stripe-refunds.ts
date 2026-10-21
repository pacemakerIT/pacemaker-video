import { OrderStatus } from '@prisma/client';
import type Stripe from 'stripe';
import { isUuid } from './checkout-items';
import prisma from './prisma';
import { lockOrderStatus, stripeObjectId } from './stripe-fulfillment';

export type ChargeRefundResult = {
  orderId: string | null;
  status:
    'refunded' | 'already_refunded' | 'partial_refund_ignored' | 'ignored';
};

// Partial refund policy: only a fully refunded charge revokes access. A
// partial refund is a price adjustment (Stripe cannot tell us which item it
// covers), so the order stays COMPLETED and the event is logged for manual
// follow-up. Once later partial refunds reach the full amount Stripe sends
// another charge.refunded with `refunded: true`, which is handled as a full
// refund.
function isFullyRefunded(charge: Stripe.Charge) {
  return charge.refunded || charge.amount_refunded >= charge.amount;
}

async function findOrderIdForPaymentIntent(
  stripe: Stripe,
  paymentIntentId: string
) {
  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { id: true }
  });

  if (order) return order.id;

  // Fulfillment stores the payment intent id, but a refund can arrive before
  // checkout.session.completed was processed. Fall back to the session.
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1
  });
  const session = sessions.data[0];
  const candidates = [session?.metadata?.orderId, session?.client_reference_id];

  // Other integrations on the same Stripe account may use these fields for
  // their own references; only an app order id (a UUID) is looked up.
  return (
    candidates.find(
      (value): value is string => typeof value === 'string' && isUuid(value)
    ) ?? null
  );
}

export async function refundOrderForCharge(
  stripe: Stripe,
  charge: Stripe.Charge
): Promise<ChargeRefundResult> {
  const paymentIntentId = stripeObjectId(charge.payment_intent);

  if (!paymentIntentId) {
    return { orderId: null, status: 'ignored' };
  }

  const orderId = await findOrderIdForPaymentIntent(stripe, paymentIntentId);

  if (!orderId) {
    return { orderId: null, status: 'ignored' };
  }

  if (!isFullyRefunded(charge)) {
    // eslint-disable-next-line no-console
    console.warn('[STRIPE] Partial refund left order access unchanged', {
      orderId,
      chargeId: charge.id,
      amount: charge.amount,
      amountRefunded: charge.amount_refunded
    });

    return { orderId, status: 'partial_refund_ignored' };
  }

  return prisma.$transaction(async (tx): Promise<ChargeRefundResult> => {
    // Wait for any in-flight checkout fulfillment of this order; its workshop
    // seats are then committed and removed below.
    if (!(await lockOrderStatus(tx, orderId))) {
      return { orderId: null, status: 'ignored' };
    }

    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { id: true, status: true, stripePaymentIntentId: true }
    });

    if (
      order.stripePaymentIntentId &&
      order.stripePaymentIntentId !== paymentIntentId
    ) {
      throw new Error('Stripe payment intent does not match the order');
    }

    if (order.status === OrderStatus.REFUNDED) {
      return { orderId: order.id, status: 'already_refunded' };
    }

    // Video, ebook and course access is derived from COMPLETED orders, so the
    // status change revokes them. Workshop seats are stored separately.
    await tx.userWorkshop.deleteMany({
      where: { orderId: order.id }
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.REFUNDED,
        stripePaymentIntentId: paymentIntentId
      }
    });

    return { orderId: order.id, status: 'refunded' };
  });
}
