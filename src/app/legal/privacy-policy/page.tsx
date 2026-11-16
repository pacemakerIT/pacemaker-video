import type { Metadata } from 'next';
import LegalDocumentView from '@/components/legal/legal-document-view';
import { getLegalDocument } from '@/lib/legal-documents';

const legalDocument = getLegalDocument('privacy-policy');

// The body is read from src/content/legal at build time.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: legalDocument.title,
  description: legalDocument.description
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentView slug="privacy-policy" />;
}
