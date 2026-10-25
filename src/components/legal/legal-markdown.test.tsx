import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { extractSectionHeadings } from '@/lib/legal-documents';
import LegalMarkdown from './legal-markdown';

const markdown = [
  'Intro paragraph.',
  '',
  '## 1. **About** Pacemaker',
  '',
  'See the [Refund Policy](/legal/refund-policy) or [email us](mailto:Hello@pacemakerca.com).',
  '',
  '## 2. Contact'
].join('\n');

describe('LegalMarkdown', () => {
  it('gives section headings the same anchors as the table of contents', () => {
    render(<LegalMarkdown markdown={markdown} />);

    const headingIds = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.id);

    expect(headingIds).toEqual(['1-about-pacemaker', '2-contact']);
    // The TOC reads raw markdown, so inline formatting must not change the id.
    expect(extractSectionHeadings(markdown).map(({ id }) => id)).toEqual(
      headingIds
    );
  });

  it('renders internal and external links', () => {
    render(<LegalMarkdown markdown={markdown} />);

    expect(screen.getByRole('link', { name: 'Refund Policy' })).toHaveAttribute(
      'href',
      '/legal/refund-policy'
    );
    expect(screen.getByRole('link', { name: 'email us' })).toHaveAttribute(
      'href',
      'mailto:Hello@pacemakerca.com'
    );
  });
});
