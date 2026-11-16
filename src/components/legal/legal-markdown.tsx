import Link from 'next/link';
import Markdown, { type Components } from 'react-markdown';
import { slugifyHeading } from '@/lib/legal-documents';

type HastNode = {
  type: string;
  value?: string;
  children?: HastNode[];
};

function getNodeText(node: HastNode | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(getNodeText).join('');
}

const components: Components = {
  h2: ({ node, children }) => (
    <h2
      id={slugifyHeading(getNodeText(node as HastNode))}
      className="mt-12 scroll-mt-28 font-headline text-xl font-bold text-navy first:mt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-headline text-base font-bold text-navy">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="mt-4 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 leading-7">{children}</ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-navy">{children}</strong>
  ),
  a: ({ href = '', children }) => {
    const className =
      'font-medium text-navy underline underline-offset-2 hover:text-orange';

    if (href.startsWith('/')) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
};

export default function LegalMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="text-base text-body-text">
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  );
}
