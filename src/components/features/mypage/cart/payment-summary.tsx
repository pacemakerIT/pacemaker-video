'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { CartItem } from '@/types/my-card';
import { amountToCents, formatMoneyFromCents } from '@/lib/money';
import { toast } from 'sonner';

interface PaymentSummaryProps {
  cartItems: CartItem[];
}

export default function PaymentSummary({ cartItems }: PaymentSummaryProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isApplyingPromotionCode, setIsApplyingPromotionCode] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [promotionCodeInput, setPromotionCodeInput] = useState('');
  const [appliedPromotionCode, setAppliedPromotionCode] = useState<
    string | null
  >(null);

  const selectedItem = cartItems.filter((item) => item.selected);
  const selectedItemsPayload = selectedItem.map((item) => ({
    itemId: item.itemId,
    itemType: item.type
  }));
  const subtotal = selectedItem.reduce(
    (acc, item) => acc + (Number(item.price) || 0),
    0
  );
  const subtotalCents = amountToCents(subtotal);
  const discountCents = 0;
  const taxCents = 0;
  const totalCents = subtotalCents - discountCents + taxCents;
  const isCheckoutDisabled =
    selectedItem.length === 0 || isCheckingOut || isApplyingPromotionCode;
  const formatCartAmount = (cents: number) =>
    formatMoneyFromCents(cents, 'cad', 'en-US');
  const trimmedPromotionCode = promotionCodeInput.trim();
  const discountDisplay = appliedPromotionCode
    ? 'Applied at checkout'
    : `-${formatCartAmount(discountCents)}`;
  const totalLabel = appliedPromotionCode ? 'Before discount' : 'Total';

  const handlePromotionCodeChange = (value: string) => {
    setPromotionCodeInput(value);

    if (
      appliedPromotionCode &&
      value.trim().toLowerCase() !== appliedPromotionCode.toLowerCase()
    ) {
      setAppliedPromotionCode(null);
    }
  };

  const applyPromotionCode = async () => {
    if (selectedItem.length === 0) {
      const message = 'Please select items to check out.';
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    if (!trimmedPromotionCode) {
      const message = 'Please enter a promo code.';
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    setIsApplyingPromotionCode(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/stripe/validate-promotion-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedItems: selectedItemsPayload,
          promotionCode: trimmedPromotionCode
        })
      });
      const data = await response.json();

      if (!response.ok || !data.promotionCode?.code) {
        throw new Error(data.error || 'Unable to apply the promo code.');
      }

      setAppliedPromotionCode(data.promotionCode.code);
      setPromotionCodeInput(data.promotionCode.code);
      toast.success('Promo code applied.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to apply the promo code.';

      setAppliedPromotionCode(null);
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setIsApplyingPromotionCode(false);
    }
  };

  const startCheckout = async () => {
    if (selectedItem.length === 0) {
      const message = 'Please select items to check out.';
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    if (trimmedPromotionCode && !appliedPromotionCode) {
      const message = 'Please apply your promo code before checkout.';
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedItems: selectedItemsPayload,
          ...(appliedPromotionCode
            ? { promotionCode: appliedPromotionCode }
            : {})
        })
      });
      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Unable to start checkout.');
      }

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to start checkout.';

      setCheckoutError(message);
      toast.error(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <aside
      aria-label="Checkout summary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eaecf0] bg-white shadow-[0_-8px_30px_rgba(0,38,59,0.06)]"
    >
      <div
        id="cart-order-details"
        hidden={!showDetails}
        className="max-h-[65dvh] overflow-y-auto border-b border-gray-100 bg-white"
        onKeyDown={(event) => {
          if (event.key === 'Escape') setShowDetails(false);
        }}
      >
        <div className="mx-auto max-w-[1248px] space-y-4 px-4 py-6 text-navy sm:px-6">
          <h2 className="font-headline text-base font-bold">Order Summary</h2>
          <div className="grid grid-cols-1 items-start gap-8 text-sm md:grid-cols-2">
            <dl className="space-y-3">
              <div className="flex justify-between gap-4 text-body-text">
                <dt>
                  Subtotal ({selectedItem.length}{' '}
                  {selectedItem.length === 1 ? 'item' : 'items'})
                </dt>
                <dd className="font-bold text-navy">
                  {formatCartAmount(subtotalCents)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-orange">
                <dt>Discount</dt>
                <dd className="font-bold">{discountDisplay}</dd>
              </div>
              <div className="flex justify-between gap-4 text-body-text">
                <dt>Tax</dt>
                <dd className="font-bold text-navy">
                  {formatCartAmount(taxCents)}
                </dd>
              </div>
            </dl>
            <div className="space-y-2.5">
              <label
                htmlFor="cart-promo-code"
                className="block text-xs font-bold uppercase tracking-wider text-navy"
              >
                Promo code
              </label>
              <div className="flex gap-2">
                <input
                  id="cart-promo-code"
                  type="text"
                  value={promotionCodeInput}
                  onChange={(event) =>
                    handlePromotionCodeChange(event.target.value)
                  }
                  placeholder="Enter promo code"
                  className="min-w-0 flex-1 rounded-none border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-navy placeholder:text-gray-300 focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
                />
                <button
                  type="button"
                  onClick={applyPromotionCode}
                  disabled={
                    isApplyingPromotionCode ||
                    isCheckingOut ||
                    selectedItem.length === 0 ||
                    !trimmedPromotionCode
                  }
                  className="shrink-0 bg-navy px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#001e2f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApplyingPromotionCode
                    ? 'Checking...'
                    : appliedPromotionCode
                      ? 'Change'
                      : 'Apply'}
                </button>
              </div>
              {appliedPromotionCode && (
                <p className="text-xs text-orange">
                  Applied code: {appliedPromotionCode}
                </p>
              )}
              {appliedPromotionCode && (
                <p className="text-xs text-body-text">
                  Your promo discount will be reflected at checkout.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {checkoutError && (
        <p
          role="alert"
          className="mx-auto max-w-[1248px] px-4 py-2 text-sm text-red-600 sm:px-6"
        >
          {checkoutError}
        </p>
      )}
      <div className="border-t border-navy/10 bg-navy pb-[env(safe-area-inset-bottom)] text-white shadow-[0_-8px_30px_rgba(0,38,59,0.15)]">
        <div className="relative mx-auto flex max-w-[1248px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <button
            type="button"
            aria-expanded={showDetails}
            aria-controls="cart-order-details"
            onClick={() => setShowDetails(!showDetails)}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-white/70 transition-colors hover:text-white lg:absolute lg:left-1/2 lg:-translate-x-1/2"
          >
            {showDetails ? 'Close' : 'View details'}
            {showDetails ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
          <div className="ml-auto flex items-center justify-end gap-3 sm:gap-5">
            <div
              className="flex flex-col gap-0.5 text-right sm:flex-row sm:items-center sm:gap-3"
              aria-live="polite"
            >
              <span className="text-[10px] font-bold uppercase leading-none tracking-[0.22em] text-white/65 sm:text-xs">
                {totalLabel}
              </span>
              <span className="font-headline text-lg font-extrabold leading-none sm:text-3xl">
                {formatCartAmount(totalCents)}
              </span>
            </div>
            <button
              type="button"
              onClick={startCheckout}
              disabled={isCheckoutDisabled}
              className="shrink-0 whitespace-nowrap rounded-full bg-orange px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_12px_24px_rgba(255,79,2,0.28)] transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-8 sm:py-3 sm:text-sm"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
