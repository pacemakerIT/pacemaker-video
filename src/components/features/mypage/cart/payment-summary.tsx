import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/my-card';
import { useRouter } from 'next/navigation';

interface PaymentSummaryProps {
  cartItems: CartItem[];
}

export default function PaymentSummary({ cartItems }: PaymentSummaryProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const selectedItem = cartItems.filter((item) => item.selected);
  const subtotal = selectedItem.reduce(
    (acc, item) => acc + (Number(item.price) || 0),
    0
  );
  const discount = 20;
  const tax = subtotal * 0.13;
  const total = subtotal - discount + tax;

  const goToPaymentSuccess = () => {
    router.push('/mypage/payment-success');
  };
  return (
    <>
      <aside className="hidden lg:block w-80 h-full border-l p-10 pt-20">
        <h2 className="text-lg font-bold mb-4">예상 결제 금액</h2>
        <ul className="space-y-4 mb-6 font-normal border-b border-pace-gray-700 pb-6 text-pace-base text-pace-gray-700">
          <li className="flex justify-between">
            <span className="text-[#6B7280]">
              소계 ({selectedItem.length}개의 강의)
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[#6B7280]">할인 금액</span>
            <span>-${discount.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[#6B7280]">세금</span>
            <span>${tax.toFixed(2)}</span>
          </li>
        </ul>
        <div className="flex justify-between text-pace-base font-semibold pb-6">
          <span className="text-pace-gray-700">총 결제 금액</span>
          <span className="text-[#E86642] font-bold">${total.toFixed(2)}</span>
        </div>
        <input
          type="text"
          placeholder="프로모션 코드 입력"
          className="w-full flex-1 mb-1 px-4 py-2 placeholder-[#757575] rounded-full border border-[#EEEEEE] focus:border-[#6F6F6F] focus:outline-none"
        />
        <button className="w-full px-4 py-2 text-pace-gray-700 rounded-full border border-[#EEEEEE] hover:border-[#6F6F6F]">
          등록
        </button>
        <button
          className="w-full h-[56px] bg-orange-500 text-white py-2 mt-6 rounded-full"
          onClick={goToPaymentSuccess}
        >
          결제하기
        </button>
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
                    소계 ({selectedItem.length}개의 강의)
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#6B7280]">할인 금액</span>
                  <span>-${discount.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#6B7280]">세금</span>
                  <span>${tax.toFixed(2)}</span>
                </li>
              </ul>
              <div className="border-b border-pace-gray-700 mb-4">
                <div className="w-60 h-[37px] flex gap-1 my-6 text-pace-sm ml-auto">
                  <input
                    type="text"
                    placeholder="프로모션 코드 입력"
                    className="flex-1 min-w-0 px-4 py-2 placeholder-[#757575] rounded-full border border-[#EEEEEE] focus:border-[#6F6F6F] focus:outline-none"
                  />
                  <button className="px-4 py-2 text-pace-gray-700 rounded-full border border-[#EEEEEE] hover:border-[#6F6F6F]">
                    등록
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 총 금액 & 결제 버튼 */}
          <div className="w-2/3 flex justify-between items-center text-pace-xl">
            <span className="font-medium">총 결제 금액</span>
            <div className="flex items-center gap-4">
              <span className="text-[#E86642] font-bold">
                ${total.toFixed(2)}
              </span>
              <button
                className="w-60 h-[56px] bg-orange-500 text-white px-4 py-2 rounded-full text-pace-lg"
                onClick={goToPaymentSuccess}
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
