'use client';
import { useEffect, useState } from 'react';
import CartList from '@/components/features/mypage/cart/cart-list';
import PaymentSummary from '@/components/features/mypage/cart/payment-summary';
import { CartItem } from '@/types/my-card';
import { useCartContext } from '@/app/context/cart-context';

export default function CartContent({
  children
}: {
  children: React.ReactNode;
}) {
  const { cart } = useCartContext();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems((previous) =>
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
        thumbnail: item.thumbnail,
        selected:
          previous.find(
            (entry) =>
              entry.itemId === item.itemId && entry.type === item.itemType
          )?.selected ?? true
      }))
    );
  }, [cart]);

  return (
    <div className="w-full min-w-0">
      <CartList cartItems={cartItems} setCartItems={setCartItems} />
      {children}
      <PaymentSummary cartItems={cartItems} />
    </div>
  );
}
