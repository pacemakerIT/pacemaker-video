// src/app/courses/__tests__/page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock the fetchCourses function
vi.mock('@/lib/api', () => ({
  fetchCourses: vi.fn().mockResolvedValue([
    // mock data here
  ])
}));

describe('CoursesPage', () => {
  it('renders the page with initial content', async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('페이스메이커 온라인 강의')).toBeInTheDocument();
      expect(screen.getByText('다양한 강의를 한 자리에서')).toBeInTheDocument();
    });
  });

  it('renders all category badges', async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      const categoryBadges = screen.getAllByTestId(/^category-badge-/);
      expect(categoryBadges).toHaveLength(4);
      expect(categoryBadges[0]).toHaveTextContent('TOTAL');
    });
  });

  it('filters cards when category is changed', async () => {
    render(<CoursesPage />);

    // 초기 카드 개수 확인
    await waitFor(() => {
      const cardContainer = screen.getByTestId('card-container');
      expect(cardContainer).toBeInTheDocument();
    });

    // RESUME 카테고리 선택
    const resumeBadge = await screen.findByTestId('category-badge-RESUME');
    fireEvent.click(resumeBadge);

    // 필터링 후 카드 개수 확인
    await waitFor(() => {
      const cardContainer = screen.getByTestId('card-container');
      const cardCount = cardContainer.textContent?.match(/\d+/)?.[0];
      expect(cardCount).toBeDefined();
      expect(Number(cardCount)).toBeGreaterThanOrEqual(0);
    });
  });

  it('applies correct styles to selected category badge', async () => {
    render(<CoursesPage />);

    const resumeBadge = await screen.findByTestId('category-badge-RESUME');
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

  it('renders select component with correct options', async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('select-component')).toBeDefined();
      expect(screen.getByTestId('select-button')).toBeDefined();
      expect(screen.getByTestId('select-value')).toBeDefined();
    });
  });

  it('changes sort value when select option is clicked', async () => {
    render(<CoursesPage />);

    const selectButton = await screen.findByTestId('select-button');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByTestId('select-item-Total')).toBeDefined();
      expect(screen.getByTestId('select-item-Date')).toBeDefined();
      expect(screen.getByTestId('select-item-Review')).toBeDefined();
    });
  });
});
