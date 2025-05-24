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

// Mock the Select component
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-component">
      <button data-testid="select-button" onClick={() => onValueChange('Date')}>
        {value}
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => (
    <div data-testid="select-trigger-container">{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
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
    const categoryBadges = screen.getAllByTestId(/^category-badge-/);
    expect(categoryBadges).toHaveLength(4);
    expect(categoryBadges[0]).toHaveTextContent('Total');
    expect(categoryBadges[1]).toHaveTextContent('Interview');
    expect(categoryBadges[2]).toHaveTextContent('Resume');
    expect(categoryBadges[3]).toHaveTextContent('Networking');
  });

  it('filters cards when category is changed', () => {
    render(<CoursesPage />);

    // 초기 카드 개수 확인
    const initialCards = screen.getByTestId('card-container').textContent;
    expect(initialCards).toMatch(/\d+ cards/);

    // Resume 카테고리 클릭
    const resumeBadge = screen.getByTestId('category-badge-Resume');
    fireEvent.click(resumeBadge);
    expect(screen.getByTestId('card-container')).toHaveTextContent('3 cards');

    // Total 카테고리 클릭
    const totalBadge = screen.getByTestId('category-badge-Total');
    fireEvent.click(totalBadge);
    expect(screen.getByTestId('card-container')).toHaveTextContent(
      initialCards || ''
    );
  });

  it('applies correct styles to selected category badge', () => {
    render(<CoursesPage />);
    const resumeBadge = screen.getByTestId('category-badge-Resume');
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

  it('renders select component with correct options', () => {
    render(<CoursesPage />);

    // Select 컴포넌트가 렌더링되었는지 확인
    expect(screen.getByTestId('select-component')).toBeDefined();
    expect(screen.getByTestId('select-button')).toBeDefined();
    expect(screen.getByTestId('select-value')).toBeDefined();
  });

  it('changes sort value when select option is clicked', () => {
    render(<CoursesPage />);

    // Select 버튼 클릭
    const selectButton = screen.getByTestId('select-button');
    fireEvent.click(selectButton);

    // Select 아이템이 렌더링되었는지 확인
    expect(screen.getByTestId('select-item-Total')).toBeDefined();
    expect(screen.getByTestId('select-item-Date')).toBeDefined();
    expect(screen.getByTestId('select-item-Review')).toBeDefined();
  });
});
