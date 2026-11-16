'use client';

import '@/lib/polyfills';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const FIT_WIDTH_ZOOM = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const SWIPE_DISTANCE = 60;
const SWIPE_DRIFT = 80;
const PAGE_GUTTER = 48;

interface PdfViewerProps {
  ebookId: string;
  /** Reports the page the reader is on, so the page can show progress. */
  onPageChange?: (page: number, totalPages: number) => void;
}

export default function PdfViewer({ ebookId, onPageChange }: PdfViewerProps) {
  const { isSignedIn } = useAuth();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(FIT_WIDTH_ZOOM);
  const [containerWidth, setContainerWidth] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Fit the page to the viewport so a phone never needs sideways scrolling at 1x.
  // The wrapper is measured rather than the scroll container: a zoomed page
  // widens the scrollable content, and measuring that would feed back into the
  // page width on every zoom step.
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const measure = () => setContainerWidth(node.clientWidth);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      window.addEventListener('orientationchange', measure);
      return () => {
        window.removeEventListener('resize', measure);
        window.removeEventListener('orientationchange', measure);
      };
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    // The API checks entitlement and answers with a short lived signed URL, so
    // the file itself travels from storage to the browser directly.
    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        setPdfUrl(null);

        const response = await fetch(`/api/ebooks/${ebookId}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.error || 'PDF를 불러올 권한을 확인하지 못했습니다.'
          );
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json().catch(() => null);
          if (!data?.url) {
            throw new Error(
              data?.error || 'PDF를 불러올 권한을 확인하지 못했습니다.'
            );
          }
          setPdfUrl(data.url as string);
        } else if (
          contentType.includes('application/pdf') ||
          contentType.includes('application/octet-stream')
        ) {
          setPdfUrl(URL.createObjectURL(await response.blob()));
        } else {
          throw new Error('PDF 응답 형식을 확인할 수 없습니다.');
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchSignedUrl();

    return () => controller.abort();
  }, [ebookId, isSignedIn, retryCount]);

  useEffect(() => {
    if (!pdfUrl?.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  useEffect(() => {
    if (numPages > 0) onPageChange?.(pageNumber, numPages);
  }, [pageNumber, numPages, onPageChange]);

  const goToPage = useCallback(
    (next: number) => {
      if (!numPages) return;
      setPageNumber(Math.min(Math.max(next, 1), numPages));
    },
    [numPages]
  );

  // A new page always starts at the top, however far the reader scrolled.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pageNumber]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        goToPage(pageNumber - 1);
      } else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        goToPage(pageNumber + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToPage, pageNumber]);

  const handleTouchStart = (event: React.TouchEvent) => {
    if (zoom > FIT_WIDTH_ZOOM || event.touches.length > 1) {
      touchStart.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_DISTANCE || Math.abs(deltaY) > SWIPE_DRIFT) {
      return;
    }
    goToPage(deltaX < 0 ? pageNumber + 1 : pageNumber - 1);
  };

  const pageWidth = containerWidth
    ? Math.max(Math.floor((containerWidth - PAGE_GUTTER) * zoom), 240)
    : undefined;

  const isReady = !loading && !error && Boolean(pdfUrl);

  // The scroll container stays mounted through every state so its width is
  // measured before the first page renders.
  const content = loading ? (
    <div className="flex min-h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-navy/15 border-t-orange"
          aria-hidden
        />
        <p className="font-body text-sm text-body">Loading pages</p>
      </div>
    </div>
  ) : !isReady ? (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="font-body text-base text-body">
          {error ?? 'PDF를 표시할 수 없습니다.'}
        </p>
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-orange px-8 py-3.5 font-[family-name:var(--font-heading)] text-base font-bold text-white shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all hover:bg-orange-hover hover:scale-[1.02] active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  ) : (
    <Document
      file={pdfUrl}
      onLoadSuccess={({ numPages: total }) => setNumPages(total)}
      onLoadError={() => setError('PDF 파일을 여는 중 문제가 발생했습니다.')}
      loading={
        <div className="flex h-40 items-center justify-center">
          <span
            className="h-6 w-6 animate-spin rounded-full border-2 border-navy/15 border-t-orange"
            aria-hidden
          />
        </div>
      }
      error={
        <p className="py-10 text-center font-body text-sm text-body">
          PDF 파일을 여는 중 문제가 발생했습니다.
        </p>
      }
      className="flex w-fit min-w-full justify-center"
    >
      {pageWidth ? (
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="overflow-hidden bg-white shadow-card"
          loading={
            <div
              className="bg-white shadow-card"
              style={{ width: pageWidth, height: pageWidth * 1.414 }}
            />
          }
        />
      ) : null}
    </Document>
  );

  return (
    <div
      ref={wrapperRef}
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-gray-soft"
    >
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`min-h-0 w-full min-w-0 flex-1 select-none overscroll-contain px-3 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-navy/15 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-navy/30 ${
          zoom <= FIT_WIDTH_ZOOM
            ? 'overflow-x-hidden overflow-y-auto'
            : 'overflow-auto'
        }`}
      >
        {content}
      </div>

      {isReady && (
        <div className="flex items-center justify-between gap-3 border-t border-navy/10 bg-white px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 rounded-xl bg-gray-soft/80 p-1">
            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.max(value - ZOOM_STEP, MIN_ZOOM))
              }
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-navy transition-all hover:bg-white hover:text-teal hover:shadow-sm active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 select-none text-center font-[family-name:var(--font-heading)] text-xs font-bold text-navy">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.min(value + ZOOM_STEP, MAX_ZOOM))
              }
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-navy transition-all hover:bg-white hover:text-teal hover:shadow-sm active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy/10 bg-white text-navy transition-all hover:border-teal/30 hover:bg-teal/5 hover:text-teal active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div
              aria-live="polite"
              className="flex min-w-[76px] select-none items-center justify-center gap-1 rounded-xl bg-gray-soft/80 px-3 py-1.5 font-[family-name:var(--font-heading)] text-sm font-bold text-navy"
            >
              <span className="font-extrabold text-teal">{pageNumber}</span>
              <span className="font-normal text-navy/30">/</span>
              <span>{numPages || '-'}</span>
            </div>
            <button
              type="button"
              onClick={() => goToPage(pageNumber + 1)}
              disabled={!numPages || pageNumber >= numPages}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy/10 bg-white text-navy transition-all hover:border-teal/30 hover:bg-teal/5 hover:text-teal active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
