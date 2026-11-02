import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PdfViewer from './pdf-viewer';

const mocks = vi.hoisted(() => ({
  auth: {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'viewer-1',
      primaryEmailAddress: { emailAddress: 'reader@example.com' }
    }
  },
  fetch: vi.fn(),
  createUrl: vi.fn(),
  revokeUrl: vi.fn()
}));
vi.mock('@clerk/nextjs', () => ({ useUser: () => mocks.auth }));
vi.mock('react-pdf', async () => {
  const { useEffect } = await import('react');
  return {
    pdfjs: { GlobalWorkerOptions: {} },
    Document: ({
      children,
      onLoadSuccess
    }: {
      children: React.ReactNode;
      onLoadSuccess: (result: { numPages: number }) => void;
    }) => {
      useEffect(() => {
        onLoadSuccess({ numPages: 2 });
      }, [onLoadSuccess]);
      return <div>{children}</div>;
    },
    Page: ({ pageNumber }: { pageNumber: number }) => (
      <div>PDF page {pageNumber}</div>
    )
  };
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth = {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'viewer-1',
      primaryEmailAddress: { emailAddress: 'reader@example.com' }
    }
  };
  vi.stubGlobal('fetch', mocks.fetch);
  vi.spyOn(URL, 'createObjectURL').mockImplementation(
    mocks.createUrl.mockReturnValue('blob:pdf')
  );
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mocks.revokeUrl);
  mocks.fetch.mockResolvedValue({
    ok: true,
    blob: async () => new Blob(['pdf'])
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('tiles the authenticated viewer email over every PDF page', async () => {
  const { container } = render(<PdfViewer ebookId="ebook-1" />);
  await screen.findByText('PDF page 2');
  const labels = container.querySelectorAll('svg pattern text');
  expect(labels).toHaveLength(2);
  labels.forEach((label) =>
    expect(label).toHaveTextContent('reader@example.com')
  );
  const patterns = Array.from(
    container.querySelectorAll('pattern'),
    (pattern) => pattern.id
  );
  expect(new Set(patterns).size).toBe(2);
  expect(mocks.fetch).toHaveBeenCalledWith(
    '/api/ebooks/ebook-1',
    expect.objectContaining({ cache: 'no-store' })
  );
});

it('waits for authentication before requesting the PDF', () => {
  mocks.auth.isLoaded = false;
  render(<PdfViewer ebookId="ebook-1" />);
  expect(mocks.fetch).not.toHaveBeenCalled();
});

it('does not request a PDF without an authenticated email', async () => {
  mocks.auth.user.primaryEmailAddress.emailAddress = '';
  render(<PdfViewer ebookId="ebook-1" />);
  expect(
    await screen.findByText(/사용자 이메일을 확인할 수 없습니다/)
  ).toBeInTheDocument();
  expect(mocks.fetch).not.toHaveBeenCalled();
});

it('removes the document and email on sign-out and releases the PDF URL', async () => {
  const { rerender, container } = render(<PdfViewer ebookId="ebook-1" />);
  await screen.findByText('PDF page 2');
  mocks.auth.isSignedIn = false;
  rerender(<PdfViewer ebookId="ebook-1" />);
  await waitFor(() => expect(container.querySelector('svg')).toBeNull());
  expect(screen.queryByText('PDF page 2')).toBeNull();
  expect(screen.queryByText(/reader@example.com/)).toBeNull();
  expect(mocks.revokeUrl).toHaveBeenCalledWith('blob:pdf');
});

it('does not display a PDF when the access check is rejected', async () => {
  mocks.fetch.mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'Purchase required' })
  });
  render(<PdfViewer ebookId="ebook-1" />);
  expect(await screen.findByText(/Purchase required/)).toBeInTheDocument();
  expect(screen.queryByText('PDF page 1')).toBeNull();
});
