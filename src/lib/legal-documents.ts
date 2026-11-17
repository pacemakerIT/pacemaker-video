export type LegalDocumentSlug =
  'terms-of-use' | 'privacy-policy' | 'refund-policy';

export type LegalDocument = {
  slug: LegalDocumentSlug;
  title: string;
  description: string;
  version: string;
  // ISO date (YYYY-MM-DD). null until the document is approved for release.
  effectiveDate: string | null;
  isDraft: boolean;
};

export type LegalSectionHeading = {
  id: string;
  text: string;
};

// Body text lives in src/content/legal/<slug>.md. Bump version and
// effectiveDate here whenever the text changes.
export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    description:
      'The terms that apply when you use Pacemaker courses, ebooks, and workshops.',
    version: '0.4',
    effectiveDate: null,
    isDraft: true
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description:
      'How Pacemaker collects, uses, and protects your personal information.',
    version: '0.4',
    effectiveDate: null,
    isDraft: true
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    description:
      'When and how you can request a refund for Pacemaker purchases.',
    version: '0.4',
    effectiveDate: null,
    isDraft: true
  }
];

export function getLegalDocument(slug: LegalDocumentSlug): LegalDocument {
  const legalDocument = LEGAL_DOCUMENTS.find((doc) => doc.slug === slug);

  if (!legalDocument) {
    throw new Error(`Unknown legal document: ${slug}`);
  }

  return legalDocument;
}

export function getLegalDocumentHref(slug: LegalDocumentSlug) {
  return `/legal/${slug}`;
}

export function slugifyHeading(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Builds the table of contents from the level-2 (##) headings of a document.
export function extractSectionHeadings(
  markdown: string
): LegalSectionHeading[] {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => {
      const text = line.slice(3).trim();
      return { id: slugifyHeading(text), text };
    });
}
