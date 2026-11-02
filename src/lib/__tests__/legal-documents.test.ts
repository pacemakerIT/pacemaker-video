import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  LEGAL_DOCUMENTS,
  extractSectionHeadings,
  getLegalDocument,
  getLegalDocumentHref,
  slugifyHeading
} from '@/lib/legal-documents';

const contentDir = path.join(process.cwd(), 'src', 'content', 'legal');

describe('legal documents', () => {
  it('has a markdown body for every registered document', () => {
    for (const legalDocument of LEGAL_DOCUMENTS) {
      expect(
        existsSync(path.join(contentDir, `${legalDocument.slug}.md`))
      ).toBe(true);
    }
  });

  it('gives every section heading a unique anchor', () => {
    for (const legalDocument of LEGAL_DOCUMENTS) {
      const markdown = readFileSync(
        path.join(contentDir, `${legalDocument.slug}.md`),
        'utf8'
      );
      const ids = extractSectionHeadings(markdown).map(({ id }) => id);

      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('only marks a document as released once it has an effective date', () => {
    for (const legalDocument of LEGAL_DOCUMENTS) {
      if (!legalDocument.isDraft) {
        expect(legalDocument.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('builds hrefs under /legal', () => {
    expect(getLegalDocumentHref('privacy-policy')).toBe(
      '/legal/privacy-policy'
    );
    expect(getLegalDocument('refund-policy').title).toBe('Refund Policy');
  });

  it('extracts level-2 headings only', () => {
    expect(
      extractSectionHeadings(
        ['Intro', '## 1. About Us', '### Detail', '## 2. Contact'].join('\n')
      )
    ).toEqual([
      { id: '1-about-us', text: '1. About Us' },
      { id: '2-contact', text: '2. Contact' }
    ]);
  });

  it('keeps letters from any language in heading anchors', () => {
    expect(slugifyHeading('3. 개인정보의 보관 기간')).toBe(
      '3-개인정보의-보관-기간'
    );
    expect(slugifyHeading('Disclaimers & Limitation of Liability')).toBe(
      'disclaimers-limitation-of-liability'
    );
  });
});
