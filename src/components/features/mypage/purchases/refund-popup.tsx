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
};

export default function RefundPopup({ open, onOpenChange }: DetailPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="min-h-11 flex-1 rounded-2xl border border-orange bg-white py-4 font-headline text-base font-bold text-orange transition-all hover:scale-[1.02] hover:bg-orange/5">
        Request refund
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-[360px] flex-col items-center gap-6 rounded-none border border-gray-100 p-8 text-navy shadow-card"
      >
        <DialogHeader className="flex flex-col items-center gap-2">
          <DialogTitle className="font-headline text-[22px] font-bold tracking-tight text-navy">
            Request refund
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed text-body-text">
            To request a refund, please send an email to pacemaker@gmail.com
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <div className="flex w-full mt-2">
              <button className="min-h-11 w-full rounded-2xl bg-orange px-10 py-3.5 font-headline font-bold text-white hover:bg-orange-hover">
                Confirm
              </button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
