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

// Mock fetch globally
global.fetch = vi.fn();

// Mock the components
vi.mock('@/components/common/card-container', () => ({
  default: ({ cards }: { cards: OnlineCards[] }) => (
    <div data-testid="card-container">
      {cards.map((card) => (
        <div key={card.id} data-testid="card">
          {card.title}
        </div>
      ))}
    </div>
  )
}));

vi.mock('@/components/common/list-header', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="list-header">{title}</div>
  )
}));

vi.mock('@/components/features/course/course-header', () => ({
  default: ({
    category,
    currentCategory,
    setCurrentCategory
  }: {
    category: string[];
    currentCategory: string;
    setCurrentCategory: (category: string) => void;
  }) => (
    <div>
      <h5 className="text-pace-orange-600 text-lg">
        {'다양한 강의를 한 자리에서'}
      </h5>
      <h3 className="text-pace-black-500 text-pace-3xl font-bold">
        {'페이스메이커 온라인 강의'}
      </h3>
      {category.map((cat) => (
        <div
          key={cat}
          data-testid={`category-badge-${cat}`}
          className={
            cat === currentCategory
              ? 'text-pace-orange-600'
              : 'text-pace-stone-600'
          }
          onClick={() => setCurrentCategory(cat)}
        >
          {cat}
        </div>
      ))}
    </div>
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
  }) => {
    let selectOpen = false;
    return (
      <div data-testid="select-component">
        <button
          data-testid="select-button"
          onClick={() => {
            selectOpen = !selectOpen;
            onValueChange('Date');
          }}
        >
          {value}
        </button>
        {selectOpen && children}
      </div>
    );
  },
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

// Mock the Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    onClick,
    className,
    'data-testid': testId
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    'data-testid'?: string;
  }) => (
    <button data-testid={testId} className={className} onClick={onClick}>
      {children}
    </button>
  )
}));

const mockCourses = [
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
];

describe('CoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch to return courses
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockCourses
    } as Response);
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

  it.skip('renders all category badges', async () => {
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

    // 초기 카드들이 로드될 때까지 대기
    await waitFor(
      () => {
        const cards = screen.getAllByTestId('card');
        expect(cards.length).toBe(2); // 총 2개의 카드가 있어야 함
      },
      { timeout: 5000 }
    );

    // RESUME 카테고리 배지 클릭
    const resumeBadge = await screen.findByTestId(
      'category-badge-RESUME',
      {},
      { timeout: 5000 }
    );
    fireEvent.click(resumeBadge);

    // 카테고리 변경 후 카드들이 필터링되었는지 확인
    await waitFor(
      () => {
        const cards = screen.getAllByTestId('card');
        // RESUME 카테고리만 필터링되어야 하므로 카드 수가 1개여야 함
        expect(cards.length).toBe(1);
        expect(cards[0]).toHaveTextContent('Test Course 2');
      },
      { timeout: 5000 }
    );
  });

  it.skip('applies correct styles to selected category badge', async () => {
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
          'Build a strong foundation\nfor your career abroad with Pacemaker'
        );
      },
      { timeout: 5000 }
    );
  });

  it.skip('renders select component with correct options', async () => {
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

  it.skip('changes sort value when select option is clicked', async () => {
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
