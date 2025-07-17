import { notFound } from 'next/navigation';
import { use } from 'react';
import PdfViewer from '@/components/features/document/pdf-viewer';
import { bucketName } from '@/lib/supabase';

type DocParams = Promise<{ docId: string }>;

export default function DocumentPage(props: { params: DocParams }) {
  const docData = use(props.params);
  const docId = docData.docId;

  if (!docId) return notFound();

  return <PdfViewer docId={docId} bucketName={bucketName} />;
}
