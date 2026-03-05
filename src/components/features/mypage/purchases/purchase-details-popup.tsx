'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import RefundPopup from './refund-popup';
import SaveReceiptPopup from './save-receipt-popup';

type PurchaseItem = {
  type: string;
  title: string;
  price: number;
};

type PaymentInfo = {
  subtotal: number;
  discount: number;
  tax: number;
  method: string;
  installment: string;
  card: string;
  total: number;
};

type DetailPopupProps = {
  orderNumber: string;
  date: string;
  items: PurchaseItem[];
  payment: PaymentInfo;
};

export default function PurchaseDetailsPopup({
  orderNumber,
  date,
  items,
  payment
}: DetailPopupProps) {
  const [isRefundPopupOpen, setIsRefundPopupOpen] = useState(false);
  const [isReceiptPopupOpen, setIsReceiptPopupOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className="p-4 bg-pace-orange-500 text-pace-white-500 rounded-full">
        View detail
      </DialogTrigger>
      <DialogContent className="max-w-lg p-10 gap-0 rounded-xl overflow-hidden font-light text-pace-base text-pace-gray-700">
        <DialogHeader className="mb-10 justify-between items-center">
          <DialogTitle className="text-[28px] font-bold text-pace-black-500">
            구매상세내역
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-pace-gray-500 font-medium text-[20px]">
              <span>주문번호</span>
              <span>{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>구매일</span>
              <span>{date}</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[20px] text-pace-gray-500 mb-4">
              구매강의 리스트
            </h3>
            <ul className="space-y-2 pb-6 border-b border-pace-gray-700">
              {items.map((item, idx) => (
                <li key={idx} className="grid grid-cols-[80px_1fr_auto]">
                  <span>{item.type}</span>
                  <span>{item.title}</span>
                  <span className="text-right">${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-[20px] text-pace-gray-500 mb-4">
              결제정보
            </h3>
            <div className="space-y-2 pb-6 mb-6 border-b border-pace-gray-200">
              <div className="flex justify-between">
                <span>소계</span>
                <span>${payment.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>할인금액</span>
                <span>${payment.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>세금</span>
                <span>${payment.tax.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span>결제 구분</span>
                <span>{payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span>할부</span>
                <span>{payment.installment}</span>
              </div>
              <div className="flex justify-between">
                <span>결제카드</span>
                <span>{payment.card}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center font-medium text-[20px] text-pace-gray-500">
            <span>총 결제 금액</span>
            <span>${payment.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-10 px-10">
          <SaveReceiptPopup
            open={isReceiptPopupOpen}
            onOpenChange={setIsReceiptPopupOpen}
          />
          <RefundPopup
            open={isRefundPopupOpen}
            onOpenChange={setIsRefundPopupOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
