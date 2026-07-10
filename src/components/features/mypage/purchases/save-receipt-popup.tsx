import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

type DetailPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl?: string | null;
};

export default function SaveReceiptPopup({
  open,
  onOpenChange,
  receiptUrl
}: DetailPopupProps) {
  const hasReceipt = Boolean(receiptUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        disabled={!hasReceipt}
        className="flex-1 border border-orange-500 text-orange-500 rounded-full px-10 py-4 hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-pace-stone-300 disabled:text-pace-stone-500 disabled:hover:bg-transparent"
      >
        {hasReceipt ? '영수증 저장' : '영수증 준비중'}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-auto flex flex-col items-center gap-6 p-8"
      >
        <DialogHeader className="flex flex-col items-center gap-2">
          <DialogTitle className="text-[20px] font-medium text-pace-gray-500">
            영수증 저장
          </DialogTitle>
          <DialogDescription className="text-center font-light !text-pace-base text-pace-gray-700">
            {hasReceipt
              ? 'Stripe 영수증을 새 창에서 여시겠습니까?'
              : '아직 연결된 영수증이 없습니다.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex gap-2">
            {receiptUrl ? (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="px-10 py-4 rounded-full bg-pace-orange-800 text-white"
              >
                확인
              </a>
            ) : (
              <DialogClose asChild>
                <button className="px-10 py-4 rounded-full bg-pace-orange-800 text-white">
                  확인
                </button>
              </DialogClose>
            )}
            <DialogClose asChild>
              <button className="px-10 py-4 rounded-full border-2 border-pace-stone-800 text-pace-stone-800">
                취소
              </button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
