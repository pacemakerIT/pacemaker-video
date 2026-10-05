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
        className="min-h-11 flex-1 rounded-2xl bg-orange py-4 font-headline text-base font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-orange-hover disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none disabled:hover:scale-100"
      >
        {hasReceipt ? 'Download receipt' : 'Receipt unavailable'}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-[360px] flex-col items-center gap-6 rounded-none border border-gray-100 p-8 text-navy shadow-card"
      >
        <DialogHeader className="flex flex-col items-center gap-2">
          <DialogTitle className="font-headline text-[22px] font-bold tracking-tight text-navy">
            Save receipt
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed text-body-text">
            {hasReceipt
              ? 'Would you like to open and save the receipt?'
              : 'A receipt is not available for this order.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex gap-2">
            {receiptUrl ? (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="min-h-11 rounded-2xl bg-orange px-8 py-3.5 font-headline font-bold text-white hover:bg-orange-hover"
              >
                Confirm
              </a>
            ) : (
              <DialogClose asChild>
                <button className="min-h-11 rounded-2xl bg-orange px-8 py-3.5 font-headline font-bold text-white hover:bg-orange-hover">
                  Confirm
                </button>
              </DialogClose>
            )}
            <DialogClose asChild>
              <button className="min-h-11 rounded-2xl border border-gray-300 px-8 py-3.5 font-headline font-semibold text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
