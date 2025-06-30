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
    <aside className="w-80 border-l p-10 pt-20">
      <h2 className="text-lg font-bold mb-4">예상 결제 금액</h2>
      <ul className="space-y-2 mb-6 border-b pb-6 text-sm">
        <li className="flex justify-between">
          <span className="text-gray-500">소계 ({selectedItem.length}개)</span>
          <span>${subtotal.toFixed(2)}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-500">할인 금액</span>
          <span>-${discount.toFixed(2)}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-500">세금</span>
          <span>${tax.toFixed(2)}</span>
        </li>
      </ul>
      <div className="flex justify-between text-lg font-bold text-[#E86642]">
        <span>총 결제 금액</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <button className="mt-6 w-full bg-orange-500 text-white py-2 rounded-full">
        결제하기
      </button>
    </aside>
  );
}
