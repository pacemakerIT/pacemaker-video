'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/my-card';
import { amountToCents, formatMoneyFromCents } from '@/lib/money';
import { toast } from 'sonner';

interface PaymentSummaryProps {
  cartItems: CartItem[];
}

export default function PaymentSummary({ cartItems }: PaymentSummaryProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const selectedItem = cartItems.filter((item) => item.selected);
  const subtotal = selectedItem.reduce(
    (acc, item) => acc + (Number(item.price) || 0),
    0
  );
  const subtotalCents = amountToCents(subtotal);
  const discountCents = 0;
  const taxCents = 0;
  const totalCents = subtotalCents - discountCents + taxCents;
  const isCheckoutDisabled = selectedItem.length === 0 || isCheckingOut;
  const formatCartAmount = (cents: number) =>
    formatMoneyFromCents(cents, 'cad', 'en-US');

  const startCheckout = async () => {
    if (selectedItem.length === 0) {
      const message = '결제할 항목을 선택해주세요.';
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
          selectedItems: selectedItem.map((item) => ({
            itemId: item.itemId,
            itemType: item.type
          }))
        })
      });
      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || '체크아웃을 시작하지 못했습니다.');
      }

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '체크아웃을 시작하지 못했습니다.';

      setCheckoutError(message);
      toast.error(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <aside className="hidden lg:block w-80 h-full border-l p-10 pt-20">
        <h2 className="text-lg font-bold mb-4">예상 결제 금액</h2>
        <ul className="space-y-4 mb-6 font-normal border-b border-pace-gray-700 pb-6 text-pace-base text-pace-gray-700">
          <li className="flex justify-between">
            <span className="text-[#6B7280]">
              소계 ({selectedItem.length}개 항목)
            </span>
            <span>{formatCartAmount(subtotalCents)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[#6B7280]">할인 금액</span>
            <span>-{formatCartAmount(discountCents)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[#6B7280]">세금</span>
            <span>{formatCartAmount(taxCents)}</span>
          </li>
        </ul>
        <div className="flex justify-between text-pace-base font-semibold pb-6">
          <span className="text-pace-gray-700">총 결제 금액</span>
          <span className="text-[#E86642] font-bold">
            {formatCartAmount(totalCents)}
          </span>
        </div>
        <button
          className="w-full h-[56px] bg-orange-500 text-white py-2 rounded-full disabled:cursor-not-allowed disabled:bg-pace-stone-300"
          onClick={startCheckout}
          disabled={isCheckoutDisabled}
        >
          {isCheckingOut ? '처리 중...' : '결제하기'}
        </button>
        {checkoutError && (
          <p className="mt-3 text-pace-sm text-red-600">{checkoutError}</p>
        )}
        <div className="flex justify-center mt-6 text-pace-stone-700 text-[12px]">
          Secure payment powered by Stripe
        </div>
      </aside>

      {/* Sticky Payment Summary */}
      <aside className="block lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pace-orange-600 py-4 z-10">
        <div className="flex flex-col items-center">
          {/* 상세보기 버튼 */}
          <div className="flex flex-col items-center text-pace-sm text-pace-stone-800 font-light mb-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '닫기' : '상세보기'}
              <Image
                src={
                  showDetails
                    ? '/icons/chevron-down.svg'
                    : '/icons/chevron-up.svg'
                }
                alt=""
                width={24}
                height={24}
              />
            </Button>
          </div>

          {/* 상세보기 내용 */}
          {showDetails && (
            <div className="w-2/3 text-pace-base text-pace-gray-700">
              <h2 className="text-pace-gray-500 text-pace-lg font-bold mb-4">
                예상 결제 금액
              </h2>
              <ul className="space-y-4 font-normal text-pace-base text-pace-gray-700">
                <li className="flex justify-between">
                  <span className="text-[#6B7280]">
                    소계 ({selectedItem.length}개 항목)
                  </span>
                  <span>{formatCartAmount(subtotalCents)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#6B7280]">할인 금액</span>
                  <span>-{formatCartAmount(discountCents)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#6B7280]">세금</span>
                  <span>{formatCartAmount(taxCents)}</span>
                </li>
              </ul>
              <div className="mt-4 border-b border-pace-gray-700" />
            </div>
          )}

          {/* 총 금액 & 결제 버튼 */}
          <div className="w-2/3 flex justify-between items-center text-pace-xl">
            <span className="font-medium">총 결제 금액</span>
            <div className="flex items-center gap-4">
              <span className="text-[#E86642] font-bold">
                {formatCartAmount(totalCents)}
              </span>
              <button
                className="w-60 h-[56px] bg-orange-500 text-white px-4 py-2 rounded-full text-pace-lg disabled:cursor-not-allowed disabled:bg-pace-stone-300"
                onClick={startCheckout}
                disabled={isCheckoutDisabled}
              >
                {isCheckingOut ? '처리 중...' : '결제하기'}
              </button>
            </div>
          </div>
          {checkoutError && (
            <p className="mt-3 w-2/3 text-right text-pace-sm text-red-600">
              {checkoutError}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
