'use client';
import { MouseEvent } from 'react';
import { Footer } from '@/components/common/footer';
import { useNavigationBlocker } from '@/components/admin/common/navigation-blocker-context';

export function AdminFooter() {
  const { attemptNavigation } = useNavigationBlocker();

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    attemptNavigation(href);
  };

  return <Footer onLinkClick={handleLinkClick} />;
}
