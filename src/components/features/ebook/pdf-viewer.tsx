'use client';

interface PdfViewerProps {
  ebookId: string;
}

export default function PdfViewer({ ebookId }: PdfViewerProps) {
  const pdfUrl = `/api/ebooks/${encodeURIComponent(ebookId)}`;
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      <iframe
        src={pdfUrl}
        title="전자책 PDF 뷰어"
        className="h-[80vh] min-h-[560px] w-full"
      />
      <p className="px-4 py-3 text-sm text-gray-600">
        PDF가 표시되지 않으면{' '}
        <a className="underline" href={pdfUrl} target="_blank" rel="noreferrer">
          새 창에서 열기
        </a>
        를 선택하세요.
      </p>
    </div>
  );
}
