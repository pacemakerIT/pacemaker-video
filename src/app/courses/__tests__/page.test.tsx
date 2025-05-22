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
    expect(screen.getByText('페이스메이커 온라인 강의')).toBeDefined();
    expect(screen.getByText('다양한 강의를 한 자리에서')).toBeDefined();
  });

  it('renders all category badges', () => {
    render(<CoursesPage />);
    expect(screen.getByText('Total')).toBeDefined();
    expect(screen.getByText('Interview')).toBeDefined();
    expect(screen.getByText('Resume')).toBeDefined();
    expect(screen.getByText('Networking')).toBeDefined();
  });

  it('filters cards when category is changed', () => {
    render(<CoursesPage />);

    // 초기 카드 개수 확인
    const initialCards = screen.getByTestId('card-container').textContent;
    expect(initialCards).toMatch(/\d+ cards/);

    // Resume 카테고리 클릭
    fireEvent.click(screen.getByText('Resume'));
    expect(screen.getByTestId('card-container')).toHaveTextContent('3 cards');

    // Total 카테고리 클릭
    fireEvent.click(screen.getByText('Total'));
    expect(screen.getByTestId('card-container')).toHaveTextContent(
      initialCards || ''
    );
  });

  it('applies correct styles to selected category badge', () => {
    render(<CoursesPage />);
    const resumeBadge = screen.getByText('Resume');
    expect(resumeBadge.className).toContain('text-pace-stone-600');
    fireEvent.click(resumeBadge);
    expect(resumeBadge.className).toContain('text-pace-orange-600');
  });

  it('renders ListHeader with correct props', () => {
    render(<CoursesPage />);
    const listHeader = screen.getByTestId('list-header');
    expect(listHeader.textContent).toBe(
      '북미 취업의 정석,\n 페이스 메이커 온라인 강의로 준비하세요.'
    );
  });
});
