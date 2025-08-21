'use client';

import Image from 'next/image';
import { useState } from 'react';
import PurchaseDetailsPopup from './purchase-details-popup';

type PurchasesListProps = {
  orderNumber: string;
  items: string[];
  amount: number;
  status: string;
  date: Date;
  isFirst: boolean;
};

export default function PurchasesList({
  orderNumber,
  items,
  amount,
  status,
  date,
  isFirst
}: PurchasesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRefunded = status === '환불완료';
  const textColorClass = isRefunded ? 'text-pace-stone-800' : '';

  const orderDetailData = {
    orderNumber: 'No.ABCD123456',
    date: '2025-05-30',
    items: [
      {
        type: '온라인 강의',
        title: '자기소개서 작성 및 면접 준비까지 하나로!',
        price: 99.99
      },
      {
        type: '전자책',
        title: '자기소개서 작성 및 면접 준비까지 하나로!',
        price: 99.99
      },
      {
        type: '워크샵',
        title: '자기소개서 작성 및 면접 준비까지 하나로!',
        price: 99.99
      },
      {
        type: '온라인 강의',
        title: '자기소개서 작성 및 면접 준비까지 하나로!',
        price: 99.99
      }
    ],
    payment: {
      subtotal: 99.99,
      discount: 99.99,
      tax: 99.99,
      method: '신용카드',
      installment: '일시불',
      card: 'visa 000 0000 000',
      total: 999.99
    }
  };

  return (
    <div className={`border-b pt-6 pb-8 ${isFirst ? 'border-t' : ''}`}>
      <div className={`flex justify-between items-center ${textColorClass}`}>
        <div>
          <div
            className={`text-pace-sm font-light space-x-4 text-pace-stone-500 ${textColorClass}`}
          >
            <span>날짜 : {date.toISOString().split('T')[0]} 결제</span>
            <span>주문번호 : No. {orderNumber}</span>
          </div>

          <h2
            className={`text-[20px] font-medium mt-1 text-pace-gray-500 ${textColorClass}`}
          >
            {items[0]}
          </h2>

          <button
            className="flex items-center mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <p className={`text-pace-gray-500 ${textColorClass}`}>
              Total Items({items.length}){' '}
            </p>
            <span
              className={`ml-1 text-pace-sm font-light text-pace-stone-800 ${textColorClass}`}
            >
              {isExpanded ? 'close' : 'More'}
            </span>
            <Image
              src={`/icons/chevron-${isExpanded ? 'up' : 'down'}.svg`}
              alt={isExpanded ? 'up' : 'down'}
              width={24}
              height={24}
            />
          </button>

          {isExpanded && (
            <ul className={`mt-2 font-light space-y-2 ${textColorClass}`}>
              {items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}

          <div className="mt-2">
            <span
              className={`text-pace-lg font-bold text-pace-gray-500 ${textColorClass}`}
            >
              ${amount}
            </span>
            <span
              className={`ml-2 font-light text-pace-sm text-pace-gray-700 ${textColorClass}`}
            >
              {status}
            </span>
          </div>
        </div>

        <PurchaseDetailsPopup
          orderNumber={orderDetailData.orderNumber}
          date={orderDetailData.date}
          items={orderDetailData.items}
          payment={orderDetailData.payment}
        />
      </div>
    </div>
  );
}
