'use client';
import { useState } from 'react';
import CartList from '@/components/cart-list';
import PaymentSummary from '@/components/payment-summary';
import { CartItem } from '@/types/my-card';

const items: CartItem[] = [
  {
    id: '1',
    itemId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 2800,
    category: 'Marketing',
    type: '전자책'
  },
  {
    id: '2',
    itemId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 15.99,
    category: 'Interview',
    type: '온라인 강의'
  },
  {
    id: '3',
    itemId: '4e8wv1z7tl',
    title: '성공을 부르는 마인드 트레이닝',
    price: 20,
    category: '',
    date: new Date('2025-05-10'),
    type: '워크샵'
  },
  {
    id: '4',
    itemId: '4e8wv1z7tl',
    title: 'Test3',
    price: 9.57,
    category: 'Resume',
    type: '온라인 강의'
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(
    items.map((item) => ({ ...item, selected: true }))
  );

  return (
    <div className="flex justify-between w-full">
      <CartList cartItems={cartItems} setCartItems={setCartItems} />
      <PaymentSummary cartItems={cartItems} />
    </div>
  );
}
