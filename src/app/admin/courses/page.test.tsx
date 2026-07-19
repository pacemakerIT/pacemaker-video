import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import CoursesAdminPage from './page';

const mocks = vi.hoisted(() => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }),
  setBlocked: vi.fn(),
  attemptNavigation: vi.fn(),
  dndOnDragEnd: undefined as
    | undefined
    | ((event: { active: { id: string }; over: { id: string } | null }) => void)
}));

vi.mock('sonner', () => ({ toast: mocks.toast }));

vi.mock('@/components/admin/common/navigation-blocker-context', () => ({
  useNavigationBlocker: () => ({
    isBlocked: false,
    setBlocked: mocks.setBlocked,
    attemptNavigation: mocks.attemptNavigation
  })
}));

vi.mock('@/components/admin/common/admin-list-layout', () => ({
  default: ({
    title,
    onSave,
    children,
    rightControls
  }: {
    title: string;
    onSave: () => void;
    children: React.ReactNode;
    rightControls: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <button onClick={onSave}>저장</button>
      {rightControls}
      {children}
    </div>
  )
}));

vi.mock('@/components/admin/common/admin-visual-row', () => ({
  default: ({
    row,
    StatusComponent,
    onStatusChange
  }: {
    row: { id: string; title: string; status: string };
    StatusComponent: React.ComponentType<{
      row: { id: string; title: string; status: string };
      toggleRow: () => void;
      onStatusChange: (id: string, status: string) => void;
    }>;
    onStatusChange: (id: string, status: string) => void;
  }) => (
    <div>
      <span>{row.title}</span>
      <StatusComponent
        row={row}
        toggleRow={() => undefined}
        onStatusChange={onStatusChange}
      />
    </div>
  )
}));

vi.mock('@/components/ui/admin/select', () => ({
  default: ({
    value,
    onChange,
    options
  }: {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
  }) => (
    <select
      aria-label={`select-${value}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}));

vi.mock('@/components/common/confirm-modal', () => ({ default: () => null }));
vi.mock('@/components/ui/checkbox', () => ({ Checkbox: () => null }));
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({
    children,
    onDragEnd
  }: {
    children: React.ReactNode;
    onDragEnd: (event: {
      active: { id: string };
      over: { id: string } | null;
    }) => void;
  }) => {
    mocks.dndOnDragEnd = onDragEnd;
    return <>{children}</>;
  },
  closestCenter: vi.fn(),
  KeyboardSensor: class {},
  PointerSensor: class {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => [])
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  arrayMove: vi.fn((items: unknown[], from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }),
  verticalListSortingStrategy: vi.fn()
}));

const course = {
  id: 'course-1',
  title: 'Private-policy test course',
  description: 'Course description',
  price: '$10',
  likes: 0,
  purchases: 0,
  status: '공개중',
  thumbnail: '',
  selected: false,
  category: 'INTERVIEW',
  orderKey: 'a0'
};

const secondCourse = {
  ...course,
  id: 'course-2',
  title: 'Second course',
  status: '비공개',
  orderKey: 'a1'
};

function response(ok = true, data = {}) {
  return {
    ok,
    json: async () => data
  } as Response;
}

describe('CoursesAdminPage visibility saves', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dndOnDragEnd = undefined;
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockFetches({
    updateOk = true,
    reorderOk = true,
    courses = [course]
  }: {
    updateOk?: boolean;
    reorderOk?: boolean;
    courses?: (typeof course)[];
  } = {}) {
    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/courses?scope=admin') {
        return Promise.resolve(response(true, courses));
      }
      if (url === '/api/courses/reorder') {
        return Promise.resolve(response(reorderOk));
      }
      if (url === '/api/courses') return Promise.resolve(response(updateOk));
      throw new Error(`Unexpected request: ${url}`);
    });
  }

  async function changeVisibilityWithoutSelectingRow() {
    await screen.findByLabelText('select-public');
    fireEvent.change(screen.getByLabelText('select-public'), {
      target: { value: 'private' }
    });
  }

  async function drag(activeId: string, overId: string) {
    await waitFor(() => expect(mocks.dndOnDragEnd).toBeTypeOf('function'));
    act(() => {
      mocks.dndOnDragEnd?.({
        active: { id: activeId },
        over: { id: overId }
      });
    });
  }

  it('persists an unchecked row whose visibility was changed', async () => {
    mockFetches();
    render(<CoursesAdminPage />);

    await changeVisibilityWithoutSelectingRow();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: 'course-1', status: '비공개' }]
        })
      });
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/courses/reorder',
      expect.anything()
    );
    expect(mocks.toast.success).toHaveBeenCalledWith('저장되었습니다.');
  });

  it('does not show a success message when a save response fails', async () => {
    mockFetches({ updateOk: false });
    render(<CoursesAdminPage />);

    await changeVisibilityWithoutSelectingRow();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith(
        '저장 중 오류가 발생했습니다.'
      );
    });
    expect(mocks.toast.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText('select-public')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => {
      expect(mocks.toast.info).toHaveBeenCalledWith(
        '저장할 변경사항이 없습니다.'
      );
    });
    expect(
      fetchMock.mock.calls.filter(
        ([url, options]) =>
          url === '/api/courses' &&
          (options as RequestInit | undefined)?.method === 'PUT'
      )
    ).toHaveLength(1);
  });

  it('does not submit a reverted visibility change', async () => {
    mockFetches();
    render(<CoursesAdminPage />);

    await changeVisibilityWithoutSelectingRow();
    fireEvent.change(screen.getByLabelText('select-private'), {
      target: { value: 'public' }
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mocks.toast.info).toHaveBeenCalledWith(
        '저장할 변경사항이 없습니다.'
      );
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/courses',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/courses/reorder',
      expect.anything()
    );
  });

  it('saves every changed row without relying on selection state', async () => {
    mockFetches({ courses: [course, secondCourse] });
    render(<CoursesAdminPage />);

    await screen.findByLabelText('select-public');
    fireEvent.change(screen.getByLabelText('select-public'), {
      target: { value: 'private' }
    });
    fireEvent.change(screen.getAllByLabelText('select-private')[1], {
      target: { value: 'public' }
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            { id: 'course-1', status: '비공개' },
            { id: 'course-2', status: '공개중' }
          ]
        })
      });
    });
  });

  it('does not submit order data after a drag is returned to its saved order', async () => {
    mockFetches({ courses: [course, secondCourse] });
    render(<CoursesAdminPage />);

    await screen.findByLabelText('select-public');
    await drag('course-1', 'course-2');
    await waitFor(() => {
      expect(mocks.setBlocked).toHaveBeenCalledWith(true);
    });
    const blockedCallCount = mocks.setBlocked.mock.calls.length;

    await drag('course-1', 'course-2');
    await waitFor(() => {
      expect(
        mocks.setBlocked.mock.calls.slice(blockedCallCount)
      ).toContainEqual([false]);
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mocks.toast.info).toHaveBeenCalledWith(
        '저장할 변경사항이 없습니다.'
      );
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/courses/reorder',
      expect.anything()
    );
  });

  it('submits the reordered rows after a drag changes their saved order', async () => {
    mockFetches({ courses: [course, secondCourse] });
    render(<CoursesAdminPage />);

    await screen.findByLabelText('select-public');
    await drag('course-1', 'course-2');
    await waitFor(() => {
      expect(mocks.setBlocked).toHaveBeenCalledWith(true);
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      const reorderCall = fetchMock.mock.calls.find(
        ([url]) => url === '/api/courses/reorder'
      );
      expect(reorderCall).toBeDefined();

      const payload = JSON.parse(reorderCall?.[1]?.body as string);
      expect(payload.items).toHaveLength(2);
      expect(payload.items.map((item: { id: string }) => item.id)).toEqual([
        'course-2',
        'course-1'
      ]);
      expect(
        payload.items.every(
          (item: { orderKey: string }) => item.orderKey.length > 0
        )
      ).toBe(true);
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/courses',
      expect.objectContaining({ method: 'PUT' })
    );
  });
});
