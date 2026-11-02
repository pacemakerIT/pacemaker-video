'use client';

import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// react-pdf touches browser-only APIs, so it must stay out of the server render.
const PdfViewer = dynamic(() => import('./pdf-viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-soft">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-navy/15 border-t-orange"
        aria-hidden
      />
    </div>
  )
});

interface EbookPdfModalProps {
  ebookId: string;
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPageChange?: (page: number, totalPages: number) => void;
}

export default function EbookPdfModal({
  ebookId,
  title,
  isOpen,
  onOpenChange,
  onPageChange
}: EbookPdfModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        // The site header is sticky at z-[100], so the reader has to sit above it.
        overlayClassName="z-[120]"
        className="left-0 top-0 z-[120] grid h-[100dvh] w-screen max-w-none overflow-hidden translate-x-0 translate-y-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-0 rounded-none border-0 bg-white p-0 sm:left-1/2 sm:top-1/2 sm:h-[90vh] sm:w-[calc(100vw-4rem)] sm:max-w-[1100px] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-navy/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-4">
          <DialogTitle className="truncate font-heading text-pace-base font-bold text-navy sm:text-pace-lg">
            {title}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close reader"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-gray-soft"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 min-w-0 overflow-hidden">
          {isOpen && (
            <PdfViewer ebookId={ebookId} onPageChange={onPageChange} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
