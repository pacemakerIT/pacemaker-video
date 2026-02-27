import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

type ConfirmModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
};

export default function ConfirmModal({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
  showCancel = true
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-auto min-w-[400px] flex flex-col items-center gap-6 p-8"
      >
        <DialogHeader className="flex flex-col items-center gap-2">
          <DialogTitle className="text-[20px] font-medium text-pace-gray-500 text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center font-light !text-pace-base text-pace-gray-700 whitespace-pre-wrap">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex gap-2 justify-center w-full">
            <button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="px-10 py-4 rounded-full bg-pace-orange-800 text-white min-w-[120px]"
            >
              {confirmText}
            </button>
            {showCancel && (
              <DialogClose asChild>
                <button className="px-10 py-4 rounded-full border-2 border-pace-stone-800 text-pace-stone-800 min-w-[120px]">
                  {cancelText}
                </button>
              </DialogClose>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
