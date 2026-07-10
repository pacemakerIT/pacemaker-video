# Stripe Payment Implementation Plan

Date: 2026-05-15
Project: `pacemaker-video`
Reference project: `pacemaker-apply`

## Goal

Connect the existing payment UI in `pacemaker-video` to the same Stripe account
used by `pacemaker-apply`, and complete the end-to-end purchase flow from cart
checkout to payment confirmation, order persistence, purchase access, receipts,
and operational verification.

## Current Readiness

- The project already has cart, payment summary, payment success, purchase list,
  and order-related UI surfaces.
- The Prisma schema already includes `Order`, `OrderItem`, `Cart`,
  `UserWorkshop`, and `OrderStatus`.
- `pacemaker-apply` already has Stripe environment variables configured for the
  target account.
- `pacemaker-video` does not yet have the `stripe` package, Stripe client
  helper, checkout API route, or Stripe webhook route.
- The current checkout button directly routes to `/mypage/payment-success`, so
  it is still a mock flow.
- The current payment success and purchases pages use hardcoded order data.
- The current video/course access logic is not fully gated by completed
  purchases.
- Verification at planning time:
  - `npm run build` passed.
  - `npm run typecheck` passed after regenerating Next/Prisma artifacts.
  - `npm test -- --run` passed with 42 passed and 4 skipped tests.

## Target Architecture

Use Stripe Hosted Checkout.

1. The user clicks the existing checkout button in the cart UI.
2. The frontend calls a server API to create a Stripe Checkout Session.
3. The server authenticates the current Clerk user and reads the selected cart
   items from the database.
4. The server calculates prices from database records, not from client-provided
   totals.
5. The server creates a `PENDING` order and stores line items.
6. The server creates a Stripe Checkout Session with `orderId` and `userId`
   metadata, then returns the Stripe checkout URL.
7. Stripe redirects the customer to `/mypage/payment-success?session_id=...`
   after payment.
8. The Stripe webhook verifies the event signature using the raw request body.
9. The webhook finalizes fulfillment by marking the order `COMPLETED`,
   attaching Stripe identifiers, removing purchased cart items, and granting
   access.
10. Success, purchase history, and access-control UI read from the database.

The success page should display payment status, but the webhook should remain
the authoritative source for fulfillment.

## Price Strategy

Recommended first implementation: create Checkout line items with Stripe
`price_data` from trusted database prices. This avoids creating and maintaining
one Stripe Price ID per course, ebook, workshop, or video.

Alternative later implementation: add `stripeProductId` and `stripePriceId` to
each purchasable model if the team wants the Stripe product catalog to be the
source of truth.

## Required Environment Variables

Add these to `pacemaker-video` local and deployment environments:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
```

Notes:

- `STRIPE_SECRET_KEY` should come from the same Stripe account used by
  `pacemaker-apply`.
- `STRIPE_WEBHOOK_SECRET` must be generated for the new
  `pacemaker-video` webhook endpoint. Webhook signing secrets are endpoint
  specific.
- `NEXT_PUBLIC_APP_URL` should point to the deployed `pacemaker-video` base URL
  in production, and can be `http://localhost:3000` locally.

## Consolidated Implementation Steps

### 1. Foundation: SDK, Environment, and Order Schema

- Install the `stripe` package.
- Add a shared `src/lib/stripe.ts` helper modeled after `pacemaker-apply`.
- Add checkout URL helpers for base URL, success URL, and safe environment value
  parsing.
- Update `.env.local.example` with Stripe-related keys.
- Confirm local and deployed environments can read the Stripe keys.
- Extend `Order` with fields needed for real Stripe reconciliation, such as:
  - `stripeCheckoutSessionId`
  - `totalAmountCents`
  - `currency`
  - `subtotalAmountCents`
  - `discountAmountCents`
  - `taxAmountCents`
  - `receiptUrl` or equivalent receipt reference
- Decide whether `stripeInvoiceId` remains useful for this flow or whether
  Stripe receipt URLs from PaymentIntent charges are enough.
- Add a migration and regenerate Prisma Client.
- Keep the existing `OrderStatus` lifecycle unless a new status is truly needed.

### 2. Checkout Creation: API and Cart UI Handoff

- Add `POST /api/stripe/create-checkout-session`.
- Use Clerk `auth()` to identify the current user.
- Fetch selected cart items from the database and validate that they still exist.
- Reject empty carts and already-purchased items.
- Calculate all totals server-side.
- Create a `PENDING` `Order` and `OrderItem` records before sending the user to
  Stripe.
- Create a Stripe Checkout Session in `payment` mode.
- Include `orderId`, `userId`, and item summary metadata.
- Return `checkoutUrl` to the frontend.
- Replace the mock `router.push('/mypage/payment-success')` behavior in
  `PaymentSummary`.
- Add loading, disabled, and error states for the checkout button.
- Submit only selected cart items if the UI continues to support selection.
- Keep the current payment summary UI, but make the displayed totals match the
  server-confirmed calculation strategy.

### 3. Webhook Fulfillment and Purchase Entitlements

- Add `POST /api/stripe/webhook`.
- Set `export const runtime = 'nodejs'`.
- Read the raw request body with `req.text()`.
- Verify the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`.
- Handle `checkout.session.completed`.
- Mark the matching order `COMPLETED` only after the payment is paid or no
  payment is required.
- Reconcile final Stripe Checkout amounts into `Order` during webhook
  fulfillment. Use Stripe's final session/payment values such as
  `amount_subtotal`, `amount_total`, `total_details.amount_discount`, and
  `total_details.amount_tax` so promotion-code purchases display the actual
  charged amount in success, receipt, and purchase history views.
- Store Stripe identifiers and receipt references.
- Remove purchased items from the cart.
- Grant workshop registration where relevant.
- Make the handler idempotent so duplicate Stripe deliveries do not duplicate
  orders or registrations.
- Update video/course access checks to use completed orders.
- Ensure ebooks are only downloadable/viewable after purchase.
- Ensure workshops create or connect `UserWorkshop` records after successful
  payment.
- Prevent users from repurchasing already-owned one-time content where
  appropriate.

### 4. Post-Payment UX: Success, Purchases, Receipts, and Refunds

- Update `/mypage/payment-success` to read `session_id`.
- Retrieve payment/order state and show real order number, items, totals, and
  customer receipt state.
- Add a real cancel page or confirm the existing `/payment/cancel` route should
  be reused.
- Ensure the success page never performs fulfillment by itself.
- Replace hardcoded `/mypage/purchases` data with real order data.
- Wire purchase detail modals to real order items and payment totals.
- Decide whether the receipt action opens a Stripe-hosted receipt URL,
  downloads a generated receipt, or shows the Stripe receipt in a modal.
- Keep refund requests manual at first unless Stripe refund automation is a
  near-term requirement.

### 5. Tests and Operational Validation

- Add unit/API tests for checkout session creation.
- Add webhook tests with mocked Stripe signature construction.
- Add webhook tests that verify promotion-code discounts update
  `subtotalAmountCents`, `discountAmountCents`, `taxAmountCents`, and
  `totalAmountCents` from Stripe's final amounts.
- Add idempotency tests for duplicate webhook delivery.
- Add entitlement tests for purchased and unpurchased content.
- Validate locally with Stripe CLI:
  - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
  - Test card: `4242 4242 4242 4242`
- Configure the production Stripe webhook endpoint for the deployed app.
- Run a production test-mode checkout before enabling live payment keys.

## Jira Tickets

| Jira Key | Summary                                           | Scope                                                                 |
| -------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| PACE-259 | Foundation: SDK, env, order schema                | Completed foundation work.                                            |
| PACE-260 | Checkout API, cart handoff, and post-payment UX   | Steps 2 and 4, plus checkout and post-payment UX test coverage.       |
| PACE-261 | Webhook fulfillment, entitlements, and validation | Steps 3 and 5, plus webhook, entitlement, and operational validation. |

Post-merge production follow-up priority as of 2026-06-29:

| Priority | Jira Key | Summary                                                | Notes                                                                                                            |
| -------- | -------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 1        | PACE-290 | [Security] Course detail API exposes locked video IDs  | Highest-priority follow-up. Production API still exposes locked `sectionsRel[].videos[].videoId` values.         |
| 2        | PACE-291 | [Bug] Ebook detail Add to cart button does nothing     | Purchase conversion bug on ebook detail. Fix after PACE-290 unless the launch plan reprioritizes ebook checkout. |
| 3        | PACE-244 | [Security] Cart/Favorites/Interest API ownership check | Broader ownership-hardening work; important but less directly tied to the PACE-261 production follow-up.         |
| 4        | PACE-245 | [Security] Public/private content exposure policy      | Broader content exposure policy audit; tackle after the confirmed course detail leak.                            |
| 5        | PACE-292 | [Bug] Mobile course and ebook detail layout overflows  | Important visual regression; can be coordinated with the active redesign detail tickets.                         |

Superseded tickets:

| Old Jira Key | Merged Into  | Original Scope                           |
| ------------ | ------------ | ---------------------------------------- |
| PACE-262     | PACE-260     | Post-payment UX, purchases, receipts     |
| PACE-263     | PACE-260/261 | Tests and operational validation         |
| PACE-264     | PACE-260     | Payment success and cancel pages         |
| PACE-265     | PACE-261     | Purchase entitlements and access control |
| PACE-266     | PACE-260     | Purchases, receipts, and refund UI       |
| PACE-267     | PACE-260/261 | Tests and operational validation         |

## Definition of Done

- A signed-in user can pay for selected cart items through Stripe Checkout.
- Stripe webhook marks the order complete and grants purchase access.
- The success page and purchase history display real order data.
- Users cannot access paid content without a completed order.
- Duplicate webhook deliveries are safe.
- Local and deployed Stripe test-mode checkouts are verified.
- Build, typecheck, and tests pass after implementation.
