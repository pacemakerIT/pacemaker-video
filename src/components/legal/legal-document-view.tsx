import { readFile } from 'node:fs/promises';
import path from 'node:path';
import LegalMarkdown from '@/components/legal/legal-markdown';
import {
  extractSectionHeadings,
  getLegalDocument,
  type LegalDocumentSlug
} from '@/lib/legal-documents';

const LEGAL_CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'legal');

function formatEffectiveDate(effectiveDate: string | null) {
  if (!effectiveDate) return 'To be announced';

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${effectiveDate}T00:00:00Z`));
}

export default async function LegalDocumentView({
  slug
}: {
  slug: LegalDocumentSlug;
}) {
  const legalDocument = getLegalDocument(slug);
  const markdown = await readFile(
    path.join(LEGAL_CONTENT_DIR, `${slug}.md`),
    'utf8'
  );
  const headings = extractSectionHeadings(markdown);

  return (
    <article aria-labelledby="legal-document-title">
      <header className="border-b border-[#eaecf0] pb-8">
        <p className="text-[0.85rem] font-bold uppercase tracking-[0.16em] text-[#667085]">
          Legal
        </p>
        <h1
          id="legal-document-title"
          className="mt-3 font-headline text-3xl font-extrabold text-navy md:text-4xl"
        >
          {legalDocument.title}
        </h1>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-body-text">
          <div className="flex gap-1">
            <dt>Effective date:</dt>
            <dd className="font-semibold text-navy">
              {formatEffectiveDate(legalDocument.effectiveDate)}
            </dd>
          </div>
          <div className="flex gap-1">
            <dt>Version:</dt>
            <dd className="font-semibold text-navy">{legalDocument.version}</dd>
          </div>
        </dl>
        {legalDocument.isDraft && (
          <p className="mt-6 rounded-lg border border-orange/30 bg-orange/5 px-4 py-3 text-sm text-navy">
            This document is a draft under review and is not yet in effect.
          </p>
        )}
      </header>

      {headings.length > 0 && (
        <nav
          aria-labelledby="legal-toc-title"
          className="mt-8 rounded-lg bg-[#f9fafb] px-5 py-4"
        >
          <h2
            id="legal-toc-title"
            className="text-sm font-bold uppercase tracking-wider text-navy"
          >
            On this page
          </h2>
          <ol className="mt-3 grid list-none gap-2 text-sm sm:grid-cols-2">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className="text-body-text underline-offset-2 hover:text-navy hover:underline"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mt-10">
        <LegalMarkdown markdown={markdown} />
      </div>
    </article>
  );
}
