import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/common/footer';

describe('Footer', () => {
  it('links to every legal document', () => {
    render(<Footer />);

    const legalNav = within(screen.getByRole('navigation', { name: 'Legal' }));

    expect(
      legalNav.getByRole('link', { name: 'Terms of Use' })
    ).toHaveAttribute('href', '/legal/terms-of-use');
    expect(
      legalNav.getByRole('link', { name: 'Privacy Policy' })
    ).toHaveAttribute('href', '/legal/privacy-policy');
    expect(
      legalNav.getByRole('link', { name: 'Refund Policy' })
    ).toHaveAttribute('href', '/legal/refund-policy');
  });

  it('passes legal link clicks to onLinkClick', () => {
    const onLinkClick = vi.fn((event) => event.preventDefault());
    render(<Footer onLinkClick={onLinkClick} />);

    fireEvent.click(screen.getByRole('link', { name: 'Privacy Policy' }));

    expect(onLinkClick).toHaveBeenCalledWith(
      expect.anything(),
      '/legal/privacy-policy'
    );
  });
});
