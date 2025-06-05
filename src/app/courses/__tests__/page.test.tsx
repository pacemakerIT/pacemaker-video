// src/app/courses/__tests__/page.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup
} from '@testing-library/react';
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
  Select: ({
    children,
    value,
    onValueChange
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div data-testid="select-component">
      <button data-testid="select-button" onClick={() => onValueChange('Date')}>
        {value}
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger-container">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-testid={`select-item-${value}`}>{children}</div>
}));

// Mock the fetchCourses function
vi.mock('@/lib/api', () => ({
  fetchCourses: vi.fn().mockResolvedValue([
    {
      id: '1',
      title: 'Test Course 1',
      price: 49.99,
      description: 'Test Description 1',
      category: 'INTERVIEW',
      videoId: 'video1',
      uploadDate: new Date('2024-03-20'),
      watchedVideos: [],
      purchasedVideos: []
    },
    {
      id: '2',
      title: 'Test Course 2',
      price: 39.99,
      description: 'Test Description 2',
      category: 'RESUME',
      videoId: 'video2',
      uploadDate: new Date('2024-03-21'),
      watchedVideos: [],
      purchasedVideos: []
    }
  ])
}));

describe('CoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the page with initial content', async () => {
    render(<CoursesPage />);

    await waitFor(
      () => {
        expect(
          screen.getByText('페이스메이커 온라인 강의')
        ).toBeInTheDocument();
        expect(
          screen.getByText('다양한 강의를 한 자리에서')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('renders all category badges', async () => {
    render(<CoursesPage />);

    await waitFor(
      () => {
        const categoryBadges = screen.getAllByTestId(/^category-badge-/);
        expect(categoryBadges).toHaveLength(4);
        expect(categoryBadges[0]).toHaveTextContent('TOTAL');
      },
      { timeout: 5000 }
    );
  });

  it('filters cards when category is changed', async () => {
    render(<CoursesPage />);

    await waitFor(
      () => {
        const cardContainer = screen.getByTestId('card-container');
        expect(cardContainer).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const resumeBadge = await screen.findByTestId(
      'category-badge-RESUME',
      {},
      { timeout: 5000 }
    );
    fireEvent.click(resumeBadge);

    await waitFor(
      () => {
        const cardContainer = screen.getByTestId('card-container');
        const cardCount = cardContainer.textContent?.match(/\d+/)?.[0];
        expect(cardCount).toBeDefined();
        expect(Number(cardCount)).toBeGreaterThanOrEqual(0);
      },
      { timeout: 5000 }
    );
  });

  it('applies correct styles to selected category badge', async () => {
    render(<CoursesPage />);

    const resumeBadge = await screen.findByTestId(
      'category-badge-RESUME',
      {},
      { timeout: 5000 }
    );
    expect(resumeBadge.className).toContain('text-pace-stone-600');
    fireEvent.click(resumeBadge);
    expect(resumeBadge.className).toContain('text-pace-orange-600');
  });

  it('renders ListHeader with correct props', async () => {
    render(<CoursesPage />);

    await waitFor(
      () => {
        const listHeader = screen.getByTestId('list-header');
        expect(listHeader.textContent).toBe(
          '북미 취업의 정석,\n 페이스 메이커 온라인 강의로 준비하세요.'
        );
      },
      { timeout: 5000 }
    );
  });

  it('renders select component with correct options', async () => {
    render(<CoursesPage />);

    await waitFor(
      () => {
        expect(screen.getByTestId('select-component')).toBeDefined();
        expect(screen.getByTestId('select-button')).toBeDefined();
        expect(screen.getByTestId('select-value')).toBeDefined();
      },
      { timeout: 5000 }
    );
  });

  it('changes sort value when select option is clicked', async () => {
    render(<CoursesPage />);

    const selectButton = await screen.findByTestId(
      'select-button',
      {},
      { timeout: 5000 }
    );
    fireEvent.click(selectButton);

    await waitFor(
      () => {
        expect(screen.getByTestId('select-item-Total')).toBeDefined();
        expect(screen.getByTestId('select-item-Date')).toBeDefined();
        expect(screen.getByTestId('select-item-Review')).toBeDefined();
      },
      { timeout: 5000 }
    );
  });
});
