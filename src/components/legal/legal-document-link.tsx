import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  getLegalDocumentHref,
  type LegalDocumentSlug
} from '@/lib/legal-documents';

type LegalDocumentLinkProps = {
  slug: LegalDocumentSlug;
  children: ReactNode;
  // Screen-reader hint for the new tab, in the language of the surrounding UI.
  newTabLabel: string;
  className?: string;
};

// Opens in a new tab so a half-filled sign-up or checkout form is not lost.
export default function LegalDocumentLink({
  slug,
  children,
  newTabLabel,
  className
}: LegalDocumentLinkProps) {
  return (
    <Link
      href={getLegalDocumentHref(slug)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only"> ({newTabLabel})</span>
    </Link>
  );
}
