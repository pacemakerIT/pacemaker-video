'use client';

import Image from 'next/image';
import { useState } from 'react';

type PurchasesListProps = {
  orderNumber: string;
  items: string[];
  amount: number;
  status: string;
  isFirst: boolean;
};

export default function PurchasesList({
  orderNumber,
  items,
  amount,
  status,
  isFirst
}: PurchasesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRefunded = status === '환불완료';
  const textColorClass = isRefunded ? 'text-pace-stone-800' : '';

  return (
    <div className={`border-b pt-6 pb-8 ${isFirst ? 'border-t' : ''}`}>
      <div className={`flex justify-between items-center ${textColorClass}`}>
        <div>
          <div
            className={`text-pace-sm font-light space-x-4 text-pace-stone-500 ${textColorClass}`}
          >
            <span>날짜 : 0000-00-00 결제</span>
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

        <button className="p-4 bg-pace-orange-500 text-pace-white-500 rounded-full">
          자세히 보기
        </button>
      </div>
    </div>
  );
}
