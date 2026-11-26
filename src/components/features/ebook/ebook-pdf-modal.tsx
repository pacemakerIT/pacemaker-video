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
        // Design system: modal overlay must be z-[2000]
        overlayClassName="z-[2000]"
        className="left-0 top-0 z-[2000] grid h-[100dvh] w-screen max-w-none overflow-hidden translate-x-0 translate-y-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-0 rounded-none border-0 bg-white p-0 sm:left-1/2 sm:top-1/2 sm:h-[90vh] sm:w-[calc(100vw-3rem)] sm:max-w-[1100px] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border sm:border-navy/10 sm:shadow-[0_20px_50px_rgba(0,38,59,0.2)]"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-navy/10 bg-white px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="hidden sm:inline-block h-2 w-2 rounded-full bg-teal"
              aria-hidden
            />
            <DialogTitle className="truncate font-[family-name:var(--font-heading)] text-base sm:text-lg font-bold text-navy tracking-tight">
              {title}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close reader"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy transition-all hover:bg-navy/10 hover:text-navy active:scale-95 focus-visible:outline-teal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 min-w-0 overflow-hidden bg-gray-soft">
          {isOpen && (
            <PdfViewer ebookId={ebookId} onPageChange={onPageChange} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
