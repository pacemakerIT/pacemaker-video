import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import SectionHeader from '../../common/section-header';
import { itemCategoryLabel } from '@/constants/labels';

interface EbookHeaderProps {
  category: string[];
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

// 카테고리 라벨 매핑 (전자책 전용 라벨 오버라이드)
const categoryMap: Record<string, string> = {
  ...itemCategoryLabel.en,
  TOTAL: 'All',
  PUBLIC: 'Public Sector',
  ACCOUNTING: 'Finance & Accounting'
};

const FILTER_HOVER_CLASSES: Record<string, string> = {
  MARKETING: 'hover:border-[#FF7E54] hover:text-[#FF7E54]',
  DESIGN: 'hover:border-[#FF6666] hover:text-[#FF6666]',
  PUBLIC: 'hover:border-[#34D399] hover:text-[#34D399]',
  IT: 'hover:border-[#36A6F7] hover:text-[#36A6F7]',
  ACCOUNTING: 'hover:border-[#37446C] hover:text-[#37446C]'
};

const FILTER_ACTIVE_CLASSES: Record<string, string> = {
  MARKETING:
    'border-[#FF7E54] text-[#FF7E54] bg-[#FF7E54]/[0.04] shadow-[0_10px_25px_-5px_rgba(255,126,84,0.2)]',
  DESIGN:
    'border-[#FF6666] text-[#FF6666] bg-[#FF6666]/[0.04] shadow-[0_10px_25px_-5px_rgba(255,102,102,0.2)]',
  PUBLIC:
    'border-[#34D399] text-[#34D399] bg-[#34D399]/[0.04] shadow-[0_10px_25px_-5px_rgba(52,211,153,0.2)]',
  IT: 'border-[#36A6F7] text-[#36A6F7] bg-[#36A6F7]/[0.04] shadow-[0_10px_25px_-5px_rgba(54,166,247,0.2)]',
  ACCOUNTING:
    'border-[#37446C] text-[#37446C] bg-[#37446C]/[0.04] shadow-[0_10px_25px_-5px_rgba(55,68,108,0.2)]'
};

const DEFAULT_HOVER = 'hover:border-orange hover:text-orange';
const DEFAULT_ACTIVE =
  'border-orange text-orange bg-orange/[0.04] shadow-[0_10px_25px_-5px_rgba(255,79,2,0.12)]';

export default function EbookHeader({
  category,
  currentCategory,
  setCurrentCategory,
  sortBy,
  setSortBy
}: EbookHeaderProps) {
  return (
    <>
      {/* 타이틀 */}
      <SectionHeader
        subtitle="Curated for What Matters Most"
        title="Pacemaker E-books"
      />

      {/* 카테고리 & 정렬 */}
      <div className="mb-8 mt-8 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          className="flex flex-wrap gap-2 md:gap-3"
          role="tablist"
          aria-label="E-book filters"
        >
          {category.map((categoryName) => {
            const isActive = categoryName === currentCategory;
            const key = categoryName.toUpperCase();
            return (
              <button
                key={categoryName}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCurrentCategory(categoryName)}
                className={`inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-[12px] border border-[#d0d5dd] bg-white px-4 font-label text-xs font-medium leading-none text-[#667085] transition-[border-color,color,background-color,box-shadow] duration-300 ease-out md:h-10 md:min-w-[110px] md:rounded-2xl md:px-6 md:text-sm ${
                  isActive
                    ? (FILTER_ACTIVE_CLASSES[key] ?? DEFAULT_ACTIVE)
                    : (FILTER_HOVER_CLASSES[key] ?? DEFAULT_HOVER)
                }`}
              >
                {categoryMap[key] || categoryName}
              </button>
            );
          })}
        </div>

        {/* 정렬 */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="h-[38px] w-full max-w-[124px] rounded-[12px] border border-[#eaecf0] bg-white px-4 font-label text-sm font-medium leading-none text-[#667085] shadow-[0_4px_12px_rgba(0,38,59,0.08)] focus:ring-0 focus:ring-offset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal md:h-12 md:w-[180px] md:max-w-none md:rounded-2xl md:px-5 md:text-base">
            <SelectValue placeholder="sort" />
          </SelectTrigger>
          <SelectContent className="bg-white border-pace-gray-100">
            <SelectItem value="Total">Total</SelectItem>
            <SelectItem value="Date">Date</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
