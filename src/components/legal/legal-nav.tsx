'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LEGAL_DOCUMENTS, getLegalDocumentHref } from '@/lib/legal-documents';

export default function LegalNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Legal documents" className="lg:sticky lg:top-28">
      <ul className="flex list-none flex-wrap gap-2 lg:flex-col lg:gap-1">
        {LEGAL_DOCUMENTS.map((legalDocument) => {
          const href = getLegalDocumentHref(legalDocument.slug);
          const isCurrent = pathname === href;

          return (
            <li key={legalDocument.slug}>
              <Link
                href={href}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'block rounded-full px-4 py-2 text-sm font-semibold no-underline transition-colors lg:rounded-lg',
                  isCurrent
                    ? 'bg-navy text-white'
                    : 'text-body-text hover:bg-[#f2f4f7] hover:text-navy'
                )}
              >
                {legalDocument.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
