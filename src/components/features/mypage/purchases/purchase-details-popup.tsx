'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { formatMoneyFromCents } from '@/lib/money';
import RefundPopup from './refund-popup';
import SaveReceiptPopup from './save-receipt-popup';
import type { PurchaseListItem, PurchasePaymentInfo } from './purchases-list';

type DetailPopupProps = {
  orderNumber: string;
  date: string;
  items: PurchaseListItem[];
  payment: PurchasePaymentInfo;
  receiptUrl: string | null;
};

export default function PurchaseDetailsPopup({
  orderNumber,
  date,
  items,
  payment,
  receiptUrl
}: DetailPopupProps) {
  const [isRefundPopupOpen, setIsRefundPopupOpen] = useState(false);
  const [isReceiptPopupOpen, setIsReceiptPopupOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className="inline-flex w-full items-center justify-center rounded-2xl bg-orange px-6 py-2.5 font-headline text-[13px] font-bold text-white transition-colors hover:bg-orange-hover md:w-auto">
        View details
      </DialogTrigger>
      <DialogContent className="top-[calc(50%+44px)] max-h-[calc(100dvh-136px)] max-w-[600px] gap-0 overflow-y-auto rounded-none border border-gray-100 px-6 pb-12 pt-16 font-body text-navy shadow-card sm:px-10 sm:py-16">
        <DialogHeader className="mb-8">
          <DialogTitle className="font-headline text-2xl font-bold tracking-tight text-navy">
            Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-[23px]">
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-bold">Order number</span>
              <span className="text-right font-headline font-bold">
                {orderNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm text-body-text">
              <span>Purchase date</span>
              <span className="font-headline">{date}</span>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-3">
            <h3 className="font-bold text-navy">Purchased items</h3>
            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="w-16 shrink-0 text-body-text sm:w-24">
                    {item.type}
                  </span>
                  <span className="min-w-0 flex-1">{item.title}</span>
                  <span className="text-right font-headline font-bold">
                    {formatMoneyFromCents(item.priceCents, payment.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-4">
            <h3 className="font-bold text-navy">Payment details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-body-text">Subtotal</span>
                <span>
                  {formatMoneyFromCents(
                    payment.subtotalCents,
                    payment.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-text">Discount</span>
                <span className="text-red-600">
                  {payment.discountCents > 0 ? '- ' : ''}
                  {formatMoneyFromCents(
                    payment.discountCents,
                    payment.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-text">Tax</span>
                <span>
                  {formatMoneyFromCents(payment.taxCents, payment.currency)}
                </span>
              </div>
            </div>
            <hr className="border-gray-200" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-body-text">Payment method</span>
                <span>{payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-text">Payment type</span>
                <span>{payment.installment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-text">Card</span>
                <span>{payment.card}</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="flex items-baseline justify-between pb-4">
            <span className="text-lg font-bold">Total paid</span>
            <span className="font-headline text-2xl font-bold">
              {formatMoneyFromCents(payment.totalCents, payment.currency)}
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
            <SaveReceiptPopup
              open={isReceiptPopupOpen}
              onOpenChange={setIsReceiptPopupOpen}
              receiptUrl={receiptUrl}
            />
            <RefundPopup
              open={isRefundPopupOpen}
              onOpenChange={setIsRefundPopupOpen}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
