'use client';

import '../../../lib/polyfills';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfViewerProps {
  docId: string;
  bucketName: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function PdfViewer({ docId, bucketName }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!isSignedIn) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/document/${docId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/pdf'
          }
        });

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [docId, bucketName, isSignedIn]);

  if (loading) return <div>PDF 로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!pdfUrl) return <div>PDF를 표시할 수 없습니다.</div>;

  return (
    <div className="max-h-[80vh] overflow-y-auto border border-solid border-gray-300 p-2.5 select-none">
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (_, index) => (
          <div
            key={`page_${index + 1}`}
            className="border border-solid border-gray-200 mb-4 select-none"
          >
            <Page
              pageNumber={index + 1}
              width={window.innerWidth > 800 ? 800 : window.innerWidth - 40}
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
