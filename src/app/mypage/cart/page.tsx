'use client';
import CartList from '@/components/cart-list';
import PaymentSummary from '@/components/payment-summary';
import { CartItem } from '@/types/my-card';
import { useState } from 'react';

const items: CartItem[] = [
  {
    id: '1',
    videoId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 2800,
    description:
      '자소서를 위한 스펙이 무엇인지와, 스펙을 쌓기 위하여 어떻게 정보를 구해야 할지 도와드릴게요.',
    category: 'Marketing',
    type: '전자책',
    selected: true
  },
  {
    id: '2',
    videoId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 15.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    category: 'Interview',
    type: '온라인 강의',
    selected: false
  },
  {
    id: '3',
    videoId: '4e8wv1z7tl',
    title: '성공을 부르는 마인드 트레이닝',
    price: 20,
    description: '마인드 트레이닝',
    category: '',
    date: new Date('2025-05-10'),
    type: '온라인 강의',
    selected: false
  },
  {
    id: '4',
    videoId: '4e8wv1z7tl',
    title: 'Test3',
    price: 9.57,
    description: 'test3',
    category: 'Resume',
    type: '온라인 강의',
    selected: false
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
