import { Badge } from '@/components/ui/badge';
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

// 카테고리 라벨 매핑
const categoryMap = itemCategoryLabel.en;

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
      <div className="w-full flex gap-4 justify-between items-center pt-8 pb-4">
        <div className="flex gap-4">
          {category.map((categoryName) => (
            <Badge
              key={categoryName}
              variant={'outline'}
              className={`${
                categoryName === currentCategory
                  ? 'border-pace-orange-600 text-pace-orange-600'
                  : 'text-pace-stone-600 border-pace-stone-600'
              } rounded-full w-full h-12 min-w-32 justify-center cursor-pointer !text-pace-base font-medium hover:text-pace-orange-600 hover:border-pace-orange-600`}
              onClick={() => setCurrentCategory(categoryName)}
            >
              {categoryMap[categoryName.toUpperCase()] || categoryName}
            </Badge>
          ))}
        </div>

        {/* 정렬 */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-[112px] h-12 text-pace-base text-pace-stone-800 bg-white shadow-sm rounded-[40px]">
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
