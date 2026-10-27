import { ItemType, OrderStatus, Prisma } from '@prisma/client';
import type Stripe from 'stripe';
import prisma from './prisma';

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

export type CheckoutFulfillmentResult = {
  orderId: string | null;
  status: 'completed' | 'already_completed' | 'ignored';
};

function stripeObjectId(
  value: string | { id?: string } | null | undefined
): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return typeof value.id === 'string' ? value.id : null;
}

function isPaidCheckoutSession(session: Stripe.Checkout.Session) {
  return (
    session.payment_status === 'paid' ||
    session.payment_status === 'no_payment_required'
  );
}

function sessionOrderId(session: Stripe.Checkout.Session) {
  return session.metadata?.orderId || session.client_reference_id || null;
}

function compactUpdateData<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as T;
}

function chargeReceiptUrl(paymentIntent: Stripe.PaymentIntent) {
  const latestCharge = paymentIntent.latest_charge;

  if (!latestCharge || typeof latestCharge === 'string') return null;
  if ('deleted' in latestCharge && latestCharge.deleted) return null;

  return latestCharge.receipt_url ?? null;
}

async function retrievePaymentIntentReceiptUrl(
  stripe: Stripe,
  paymentIntentId: string | null
) {
  if (!paymentIntentId) return null;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge']
  });

  return chargeReceiptUrl(paymentIntent);
}

async function retrieveInvoiceUrl(stripe: Stripe, invoiceId: string | null) {
  if (!invoiceId) return null;

  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice.hosted_invoice_url ?? null;
}

async function resolveStripeReferences(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const paymentIntentId = stripeObjectId(session.payment_intent);
  const customerId = stripeObjectId(session.customer);
  const invoiceId = stripeObjectId(session.invoice);
  const expandedInvoiceUrl =
    typeof session.invoice === 'object' && session.invoice
      ? (session.invoice.hosted_invoice_url ?? null)
      : null;
  const [invoiceUrl, receiptUrl] = await Promise.all([
    expandedInvoiceUrl
      ? Promise.resolve(expandedInvoiceUrl)
      : retrieveInvoiceUrl(stripe, invoiceId).catch(() => null),
    retrievePaymentIntentReceiptUrl(stripe, paymentIntentId).catch(() => null)
  ]);

  return {
    paymentIntentId,
    customerId,
    invoiceId,
    invoiceUrl,
    receiptUrl
  };
}

function orderLookupWhere(session: Stripe.Checkout.Session) {
  const conditions: Prisma.OrderWhereInput[] = [];
  const orderId = sessionOrderId(session);

  if (orderId) {
    conditions.push({ id: orderId });
  }

  if (session.id) {
    conditions.push({ stripeCheckoutSessionId: session.id });
  }

  if (!conditions.length) {
    throw new Error('Stripe checkout session is missing order metadata');
  }

  return { OR: conditions };
}

async function cartCleanupFilters(
  tx: Prisma.TransactionClient,
  order: OrderWithItems
) {
  const filters: Prisma.CartWhereInput[] = [];
  const videoItemIds = order.items
    .filter((item) => item.itemType === ItemType.VIDEO)
    .map((item) => item.itemId);
  const ebookItemIds = order.items
    .filter((item) => item.itemType === ItemType.EBOOK)
    .map((item) => item.itemId);
  const [videos, ebooks] = await Promise.all([
    videoItemIds.length
      ? tx.video.findMany({
          where: { id: { in: videoItemIds } },
          select: { id: true, videoId: true }
        })
      : Promise.resolve([] as { id: string; videoId: string }[]),
    ebookItemIds.length
      ? tx.ebook.findMany({
          where: { id: { in: ebookItemIds } },
          select: { id: true, ebookId: true }
        })
      : Promise.resolve([] as { id: string; ebookId: string }[])
  ]);
  const videoIdsById = new Map(
    videos.map((video) => [video.id, video.videoId])
  );
  const ebookIdsById = new Map(
    ebooks.map((ebook) => [ebook.id, ebook.ebookId])
  );

  for (const item of order.items) {
    const itemIds = new Set([item.itemId]);

    if (item.itemType === ItemType.VIDEO) {
      const videoId = videoIdsById.get(item.itemId);

      if (videoId) itemIds.add(videoId);
    }

    if (item.itemType === ItemType.EBOOK) {
      const ebookId = ebookIdsById.get(item.itemId);

      if (ebookId) itemIds.add(ebookId);
    }

    for (const itemId of itemIds) {
      filters.push({
        itemId,
        itemType: item.itemType
      });
    }
  }

  return filters;
}

async function grantWorkshopRegistrations(
  tx: Prisma.TransactionClient,
  order: OrderWithItems
) {
  if (!order.userId) return;

  const workshopItems = order.items.filter(
    (item) => item.itemType === ItemType.WORKSHOP
  );

  for (const item of workshopItems) {
    await tx.userWorkshop.upsert({
      where: {
        userId_workshopId: {
          userId: order.userId,
          workshopId: item.itemId
        }
      },
      update: {
        orderId: order.id
      },
      create: {
        userId: order.userId,
        workshopId: item.itemId,
        orderId: order.id
      }
    });
  }
}

async function removePurchasedCartItems(
  tx: Prisma.TransactionClient,
  order: OrderWithItems
) {
  if (!order.userId) return;

  const filters = await cartCleanupFilters(tx, order);
  if (!filters.length) return;

  await tx.cart.deleteMany({
    where: {
      userId: order.userId,
      OR: filters
    }
  });
}

export async function fulfillCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<CheckoutFulfillmentResult> {
  if (!isPaidCheckoutSession(session)) {
    return {
      orderId: sessionOrderId(session),
      status: 'ignored'
    };
  }

  const stripeReferences = await resolveStripeReferences(stripe, session);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: orderLookupWhere(session),
      include: { items: true }
    });

    if (!order) {
      throw new Error('Order not found for Stripe checkout session');
    }

    if (
      order.stripeCheckoutSessionId &&
      order.stripeCheckoutSessionId !== session.id
    ) {
      throw new Error('Stripe checkout session does not match the order');
    }

    if (order.status === OrderStatus.COMPLETED) {
      const missingStripeData =
        (!order.stripeReceiptUrl && stripeReferences.receiptUrl) ||
        (!order.stripeInvoiceUrl && stripeReferences.invoiceUrl);

      if (missingStripeData) {
        await tx.order.update({
          where: { id: order.id },
          data: compactUpdateData({
            stripePaymentIntentId:
              stripeReferences.paymentIntentId ?? undefined,
            stripeCustomerId: stripeReferences.customerId ?? undefined,
            stripeInvoiceId: stripeReferences.invoiceId ?? undefined,
            stripeInvoiceUrl: stripeReferences.invoiceUrl ?? undefined,
            stripeReceiptUrl: stripeReferences.receiptUrl ?? undefined
          })
        });
      }

      return {
        orderId: order.id,
        status: 'already_completed'
      };
    }

    await grantWorkshopRegistrations(tx, order);
    await removePurchasedCartItems(tx, order);

    await tx.order.update({
      where: { id: order.id },
      data: compactUpdateData({
        status: OrderStatus.COMPLETED,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: stripeReferences.paymentIntentId ?? undefined,
        stripeCustomerId: stripeReferences.customerId ?? undefined,
        stripeInvoiceId: stripeReferences.invoiceId ?? undefined,
        stripeInvoiceUrl: stripeReferences.invoiceUrl ?? undefined,
        stripeReceiptUrl: stripeReferences.receiptUrl ?? undefined,
        subtotalAmountCents: session.amount_subtotal ?? undefined,
        discountAmountCents:
          session.total_details?.amount_discount ?? undefined,
        taxAmountCents: session.total_details?.amount_tax ?? undefined,
        totalAmountCents: session.amount_total ?? undefined,
        currency: session.currency ?? undefined
      })
    });

    return {
      orderId: order.id,
      status: 'completed'
    };
  });
}
