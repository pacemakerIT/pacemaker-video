'use client';

import { useState } from 'react';
import type { OrderStatus } from '@prisma/client';
import { ChevronDown } from 'lucide-react';
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
  receiptUrl
}: PurchasesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRefunded = status === 'REFUNDED';
  const firstTitle = items[0]?.title ?? 'Purchased item';
  const statusClass = isRefunded
    ? 'border-red-100 bg-red-50 text-red-700'
    : 'border-emerald-100 bg-emerald-50 text-emerald-700';

  return (
    <article className="flex flex-col justify-between gap-4 border-b border-gray-soft py-5 last:border-b-0 md:flex-row md:items-center">
      <div className={`min-w-0 flex-1 ${isRefunded ? 'opacity-40' : ''}`}>
        <div className="mb-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs font-medium text-gray-400">
          <span className="whitespace-nowrap">Placed on {date}</span>
          <span className="whitespace-nowrap">
            Order no. {orderNumber.replace(/^No\.\s*/, '')}
          </span>
        </div>

        <h2 className="mb-1.5 font-headline text-[17px] font-bold tracking-tight text-navy">
          {firstTitle}
        </h2>

        <button
          type="button"
          aria-expanded={isExpanded}
          className="mb-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-gray-400 transition-colors hover:text-navy"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          <span>{isExpanded ? 'Close' : 'More'}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {isExpanded && (
          <ul className="mb-2.5 flex flex-col gap-1 border-l border-gray-200 pl-3 text-[13px] text-gray-500">
            {items.map((item) => (
              <li key={item.id}>
                {item.type} · {item.title}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <span className="font-headline text-base font-bold text-navy">
            {formatMoneyFromCents(amountCents, currency)}
          </span>
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="mt-1 flex shrink-0 justify-start md:mt-0">
        <PurchaseDetailsPopup
          orderNumber={orderNumber}
          date={date}
          items={items}
          payment={payment}
          receiptUrl={receiptUrl}
        />
      </div>
    </article>
  );
}
