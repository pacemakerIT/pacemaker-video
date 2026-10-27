import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { fulfillCheckoutSession } from '@/lib/stripe-fulfillment';
import { getStripeClient } from '@/lib/stripe';

export const runtime = 'nodejs';

function webhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!secret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET configuration');
  }

  return secret;
}

function logStripeWebhookError(
  context: string,
  error: unknown,
  details: Record<string, string | undefined> = {}
) {
  // eslint-disable-next-line no-console
  console.error(`[API ERROR] POST /api/stripe/webhook: ${context}`, {
    ...details,
    error
  });
}

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  let stripe: Stripe;
  let secret: string;
  let event: Stripe.Event;

  try {
    stripe = getStripeClient();
    secret = webhookSecret();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Stripe webhook is not configured';

    logStripeWebhookError('configuration failed', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const payload = await req.text();
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid Stripe webhook payload';

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const fulfillment = await fulfillCheckoutSession(stripe, session);

      return NextResponse.json({
        received: true,
        fulfillment
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fulfill checkout';

    logStripeWebhookError('fulfillment failed', error, {
      eventId: event.id,
      eventType: event.type
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
