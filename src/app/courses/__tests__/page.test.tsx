// src/app/courses/__tests__/page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CoursesPage from '../page';
import { OnlineCards } from '@/types/online';

// Mock the components
vi.mock('@/components/CardContainer', () => ({
  default: ({ cards }: { cards: OnlineCards[] }) => (
    <div data-testid="card-container">{cards.length} cards</div>
  )
}));

vi.mock('@/components/ListHeader', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="list-header">{title}</div>
  )
}));

describe('CoursesPage', () => {
  it('renders the page with initial content', () => {
    render(<CoursesPage />);

    // Check if the main title and subtitle are rendered
    expect(screen.getByText('페이스메이커 온라인 강의')).toBeDefined();
    expect(screen.getByText('다양한 강의를 한 자리에서')).toBeDefined();
  });

  it('renders all category badges', () => {
    render(<CoursesPage />);

    // Check if all category badges are rendered
    expect(screen.getByText('Total')).toBeDefined();
    expect(screen.getByText('Interview')).toBeDefined();
    expect(screen.getByText('Resume')).toBeDefined();
    expect(screen.getByText('Networking')).toBeDefined();
  });

  it('filters cards when category is changed', () => {
    render(<CoursesPage />);

    // Initially should show all cards
    expect(screen.getByTestId('card-container')).toHaveTextContent('9 cards');

    // Click on Resume category
    fireEvent.click(screen.getByText('Resume'));

    // Should show filtered cards
    expect(screen.getByTestId('card-container')).toHaveTextContent('3 cards');

    // Click on Total category
    fireEvent.click(screen.getByText('Total'));

    // Should show all cards again
    expect(screen.getByTestId('card-container')).toHaveTextContent('9 cards');
  });

  it('applies correct styles to selected category badge', () => {
    render(<CoursesPage />);

    const resumeBadge = screen.getByText('Resume');

    // Initially not selected
    expect(resumeBadge.className).toContain('text-pace-stone-600');

    // Click to select
    fireEvent.click(resumeBadge);

    // Should have selected styles
    expect(resumeBadge.className).toContain('text-pace-orange-600');
  });

  it('renders ListHeader with correct props', () => {
    render(<CoursesPage />);

    const listHeader = screen.getByTestId('list-header');
    expect(listHeader).toHaveTextContent(
      '북미 취업의 정석,\n 페이스 메이커 온라인 강의로 준비하세요.'
    );
  });

  it('maintains selected category state', () => {
    render(<CoursesPage />);

    // Click on Resume category
    fireEvent.click(screen.getByText('Resume'));

    // Should show filtered cards
    expect(screen.getByTestId('card-container')).toHaveTextContent('3 cards');

    // Re-render the component
    render(<CoursesPage />);

    // Should maintain the filtered state
    expect(screen.getByTestId('card-container')).toHaveTextContent('3 cards');
  });
});
