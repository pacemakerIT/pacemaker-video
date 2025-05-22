// src/components/__tests__/CustomBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomBadge } from '../CustomBadge';

describe('CustomBadge', () => {
  it('renders with default variant (Interview)', () => {
    render(<CustomBadge>Interview</CustomBadge>);
    const badge = screen.getByText('Interview');
    expect(badge).toHaveClass('bg-pace-blue-500');
    expect(badge).toHaveClass('text-pace-white-500');
    expect(badge).toHaveClass('font-light');
  });

  it('renders with Resume variant', () => {
    render(<CustomBadge variant="Resume">Resume</CustomBadge>);
    const badge = screen.getByText('Resume');
    expect(badge).toHaveClass('bg-pace-purple-500');
    expect(badge).toHaveClass('text-pace-white-500');
    expect(badge).toHaveClass('font-light');
  });

  it('renders with Networking variant', () => {
    render(<CustomBadge variant="Networking">Networking</CustomBadge>);
    const badge = screen.getByText('Networking');
    expect(badge).toHaveClass('bg-pace-yellow-500');
    expect(badge).toHaveClass('text-pace-white-500');
    expect(badge).toHaveClass('font-light');
  });

  it('applies custom className', () => {
    render(<CustomBadge className="custom-class">Custom Badge</CustomBadge>);
    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders with correct text content', () => {
    const text = 'Test Badge';
    render(<CustomBadge>{text}</CustomBadge>);
    expect(screen.getByText(text)).toBeDefined();
  });

  it('applies all variant styles correctly', () => {
    render(<CustomBadge variant="Interview">Interview</CustomBadge>);
    const badge = screen.getByText('Interview');

    // Check all expected classes
    expect(badge).toHaveClass('border-transparent');
    expect(badge).toHaveClass('bg-pace-blue-500');
    expect(badge).toHaveClass('text-pace-white-500');
    expect(badge).toHaveClass('font-light');
  });
});
