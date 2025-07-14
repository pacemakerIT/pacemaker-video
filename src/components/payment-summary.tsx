import { CartItem } from '@/types/my-card';

interface PaymentSummaryProps {
  cartItems: CartItem[];
}

export default function PaymentSummary({ cartItems }: PaymentSummaryProps) {
  const selectedItem = cartItems.filter((item) => item.selected);
  const subtotal = selectedItem.reduce((acc, item) => acc + item.price, 0);
  const discount = 20;
  const tax = subtotal * 0.13;
  const total = subtotal - discount + tax;

  return (
    <aside className="w-80 h-full border-l p-10 pt-20">
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
      <div className="flex justify-between text-pace-base font-semibold">
        <span className="text-pace-gray-700">총 결제 금액</span>
        <span className="text-[#E86642]">${total.toFixed(2)}</span>
      </div>
      <div className="w-60 h-[37px] flex gap-1 my-6 text-pace-sm">
        <input
          type="text"
          placeholder="프로모션 코드 입력"
          className="flex-1 min-w-0 px-3 py-1 placeholder-[#757575] rounded-full border border-[#EEEEEE] focus:border-[#6F6F6F] focus:outline-none"
        />
        <button className="w-[57px] px-3 py-1 text-pace-gray-700 rounded-full border border-[#EEEEEE] hover:border-[#6F6F6F]">
          등록
        </button>
      </div>
      <button className="w-full h-[56px] bg-orange-500 text-white py-2 rounded-full">
        결제하기
      </button>
      <div className="flex justify-center mt-6 text-pace-stone-700 text-[12px]">
        Secure payment powered by Stripe
      </div>
    </aside>
  );
}
