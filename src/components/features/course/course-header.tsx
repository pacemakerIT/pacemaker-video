import SectionHeader from '../../common/section-header';
import { itemCategoryLabel } from '@/constants/labels';

interface CourseHeaderProps {
  category: string[];
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

// 카테고리 라벨 매핑 (온라인 코스 전용 라벨 오버라이드)
const categoryMap: Record<string, string> = {
  ...itemCategoryLabel.en,
  TOTAL: 'All',
  INTERVIEW: 'Interview',
  RESUME: 'Resume',
  NETWORKING: 'Networking'
};

const FILTER_INACTIVE_BASE = 'border-gray-200 bg-white text-gray-500';

const FILTER_HOVER_CLASSES: Record<string, string> = {
  INTERVIEW:
    'hover:border-category-interview-badge hover:text-category-interview-badge',
  RESUME: 'hover:border-category-resume-badge hover:text-category-resume-badge',
  NETWORKING:
    'hover:border-category-networking-badge hover:text-category-networking-badge'
};

const FILTER_ACTIVE_CLASSES: Record<string, string> = {
  INTERVIEW:
    'border-category-interview-badge text-category-interview-badge bg-category-interview-badge/[0.04] shadow-[0_10px_25px_-5px_rgba(54,166,247,0.2)]',
  RESUME:
    'border-category-resume-badge text-category-resume-badge bg-category-resume-badge/[0.04] shadow-[0_10px_25px_-5px_rgba(255,150,49,0.2)]',
  NETWORKING:
    'border-category-networking-badge text-category-networking-badge bg-category-networking-badge/[0.04] shadow-[0_10px_25px_-5px_rgba(159,91,231,0.2)]'
};

const DEFAULT_HOVER = 'hover:border-orange hover:text-orange';
const DEFAULT_ACTIVE =
  'border-orange text-orange bg-orange/[0.04] shadow-[0_10px_25px_-5px_rgba(255,79,2,0.12)]';

export default function CourseHeader({
  category,
  currentCategory,
  setCurrentCategory,
  sortBy,
  setSortBy
}: CourseHeaderProps) {
  return (
    <>
      {/* 타이틀 블록 */}
      <div className="mb-8 flex flex-col justify-between items-start md:flex-row md:items-end gap-4">
        <SectionHeader
          subtitle="Explore Our Programs"
          title="Pacemaker Online Courses"
        />
      </div>

      {/* 카테고리 필터 & 정렬 */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          className="flex flex-wrap gap-2 md:gap-3"
          role="tablist"
          aria-label="Course filters"
        >
          {category.map((categoryName) => {
            const isActive = categoryName === currentCategory;
            const key = categoryName.toUpperCase();
            return (
              <button
                key={categoryName}
                type="button"
                data-testid={`category-badge-${categoryName}`}
                aria-pressed={isActive}
                onClick={() => setCurrentCategory(categoryName)}
                className={`inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-[12px] border px-4 font-headline text-xs font-medium leading-none transition-[border-color,color,background-color,box-shadow] duration-300 ease-out md:h-10 md:min-w-[110px] md:rounded-2xl md:px-6 md:text-sm ${
                  isActive
                    ? (FILTER_ACTIVE_CLASSES[key] ?? DEFAULT_ACTIVE)
                    : `${FILTER_INACTIVE_BASE} ${FILTER_HOVER_CLASSES[key] ?? DEFAULT_HOVER}`
                }`}
              >
                {categoryMap[key] || categoryName}
              </button>
            );
          })}
        </div>

        {/* 정렬 선택 */}
        <div className="relative w-full max-w-[140px] md:w-auto md:max-w-[180px]">
          <select
            id="courseSortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-[38px] w-full appearance-none rounded-[12px] border border-gray-200 bg-white pl-4 pr-10 font-headline text-sm font-medium leading-none text-gray-500 shadow-card focus:outline-none focus:ring-2 focus:ring-teal md:h-12 md:rounded-2xl md:pl-5 md:pr-12 md:text-base cursor-pointer"
            aria-label="Sort courses"
          >
            <option value="Total">Total</option>
            <option value="Date">Date</option>
            <option value="Review">Review</option>
          </select>
          <span
            className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400 md:right-4"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
      </div>
    </>
  );
}
