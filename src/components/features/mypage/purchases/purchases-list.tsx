'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { OrderStatus } from '@prisma/client';
import { formatMoneyFromCents } from '@/lib/money';
import PurchaseDetailsPopup from './purchase-details-popup';

export type PurchaseListItem = {
  id: string;
  type: string;
  title: string;
  priceCents: number;
  quantity: number;
};

export type PurchasePaymentInfo = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  method: string;
  installment: string;
  card: string;
  totalCents: number;
  currency: string;
};

type PurchasesListProps = {
  orderNumber: string;
  items: PurchaseListItem[];
  amountCents: number;
  status: OrderStatus;
  statusLabel: string;
  date: string;
  currency: string;
  payment: PurchasePaymentInfo;
  receiptUrl: string | null;
  isFirst: boolean;
};

export default function PurchasesList({
  orderNumber,
  items,
  amountCents,
  status,
  statusLabel,
  date,
  currency,
  payment,
  receiptUrl,
  isFirst
}: PurchasesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRefunded = status === 'REFUNDED';
  const textColorClass = isRefunded ? 'text-pace-stone-800' : '';
  const firstTitle = items[0]?.title ?? '구매 항목';

  return (
    <div className={`border-b pt-6 pb-8 ${isFirst ? 'border-t' : ''}`}>
      <div className={`flex justify-between items-center ${textColorClass}`}>
        <div>
          <div
            className={`text-pace-sm font-light space-x-4 text-pace-stone-500 ${textColorClass}`}
          >
            <span>날짜 : {date} 결제</span>
            <span>주문번호 : {orderNumber}</span>
          </div>

          <h2
            className={`text-[20px] font-medium mt-1 text-pace-gray-500 ${textColorClass}`}
          >
            {firstTitle}
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
              {items.map((item) => (
                <li key={item.id}>
                  {item.type} · {item.title}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2">
            <span
              className={`text-pace-lg font-bold text-pace-gray-500 ${textColorClass}`}
            >
              {formatMoneyFromCents(amountCents, currency)}
            </span>
            <span
              className={`ml-2 font-light text-pace-sm text-pace-gray-700 ${textColorClass}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <PurchaseDetailsPopup
          orderNumber={orderNumber}
          date={date}
          items={items}
          payment={payment}
          receiptUrl={receiptUrl}
        />
      </div>
    </div>
  );
}
