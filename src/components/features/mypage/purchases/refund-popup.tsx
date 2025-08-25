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
      <DialogTrigger className="flex-1 bg-orange-500 text-white rounded-full px-10 py-4 hover:bg-orange-600">
        환불요청
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-auto flex flex-col items-center gap-6 p-8"
      >
        <DialogHeader className="flex flex-col items-center gap-2">
          <DialogTitle className="text-[20px] font-medium text-pace-gray-500">
            환불 요청
          </DialogTitle>
          <DialogDescription className="text-center font-light !text-pace-base text-pace-gray-700">
            환불요청은 이메일로 문의바랍니다. <br /> pacemaker@gmail.com
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <div className="flex w-full mt-2">
              <button className="w-full px-10 py-4 rounded-full bg-pace-orange-800 text-white">
                확인
              </button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
