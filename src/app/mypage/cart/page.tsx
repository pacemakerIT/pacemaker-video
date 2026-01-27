'use client';
import { useEffect, useState } from 'react';
import CartList from '@/components/features/mypage/cart/cart-list';
import PaymentSummary from '@/components/features/mypage/cart/payment-summary';
import { CartItem } from '@/types/my-card';
import { useCartContext } from '@/app/context/cart-context';

export default function CartPage() {
  const { cart } = useCartContext();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(
      cart.map((item) => ({
        id: item.id || item.itemId,
        itemId: item.itemId,
        title: item.title || '',
        category: item.category || '',
        price:
          typeof item.price === 'string'
            ? parseFloat(item.price.replace(/[^0-9.-]+/g, ''))
            : Number(item.price) || 0,
        type: item.itemType,
        date: item.startDate ? new Date(item.startDate) : undefined,
        selected: true
      }))
    );
  }, [cart]);

  return (
    <div className="flex justify-between w-full">
      <CartList cartItems={cartItems} setCartItems={setCartItems} />
      <PaymentSummary cartItems={cartItems} />
    </div>
  );
}
