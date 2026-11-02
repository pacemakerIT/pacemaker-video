'use client';

import '../../../lib/polyfills';
import React, { useState, useEffect, useId } from 'react';
import { useUser } from '@clerk/nextjs';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfViewerProps {
  ebookId: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function EmailWatermark({ email }: { email: string }) {
  const patternId = useId().replace(/:/g, '');
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none"
    >
      <defs>
        <pattern
          id={patternId}
          width="360"
          height="180"
          patternUnits="userSpaceOnUse"
        >
          <text
            x="180"
            y="90"
            textAnchor="middle"
            transform="rotate(-25 180 90)"
            fill="#00263B"
            fillOpacity="0.16"
            fontSize="16"
            fontFamily="Arial, sans-serif"
            textLength={email.length > 34 ? 300 : undefined}
            lengthAdjust="spacingAndGlyphs"
          >
            {email}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export default function PdfViewer({ ebookId }: PdfViewerProps) {
  const [document, setDocument] = useState<{ url: string; key: string } | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const documentKey =
    isSignedIn && email ? `${user.id}:${ebookId}:${email}` : null;

  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    if (!isLoaded) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setDocument(null);
    setNumPages(undefined);
    const fetchSignedUrl = async () => {
      if (!documentKey) {
        setError(
          isSignedIn
            ? '사용자 이메일을 확인할 수 없습니다.'
            : '로그인이 필요합니다.'
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/ebooks/${ebookId}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store'
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.error || 'PDF를 불러올 권한을 확인하지 못했습니다.'
          );
        }

        const blob = await response.blob();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setDocument({ url: objectUrl, key: documentKey });
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchSignedUrl();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ebookId, documentKey, isLoaded, isSignedIn]);

  if (!isLoaded || loading) return <div>PDF 로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!document || document.key !== documentKey || !email)
    return <div>PDF를 표시할 수 없습니다.</div>;

  return (
    <div className="max-h-[80vh] overflow-y-auto border border-solid border-gray-300 p-2.5 select-none">
      <p className="mb-3 text-sm text-gray-500">Personal copy: {email}</p>
      <Document
        file={document.url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={() =>
          setError('PDF를 표시하지 못했습니다. 다시 시도해 주세요.')
        }
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div
            key={`page_${index + 1}`}
            className="relative mb-4 w-fit overflow-hidden border border-solid border-gray-200 select-none"
          >
            <Page
              pageNumber={index + 1}
              width={window.innerWidth > 800 ? 800 : window.innerWidth - 40}
            />
            <EmailWatermark email={email} />
          </div>
        ))}
      </Document>
    </div>
  );
}
