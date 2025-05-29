import Sidebar from '@/components/my-page-side-bar';
import CartList from '@/components/cart-list';
import PaymentSummary from '@/components/payment-summary';

export default function CartPage() {
  return (
    <div className="w-screen grid grid-cols-[320px_1fr_320px] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-[40px] pt-[80px]">
        <CartList />
      </main>

      <aside className="border-l p-[40px] pt-[80px]">
        <PaymentSummary />
      </aside>
    </div>
  );
}
