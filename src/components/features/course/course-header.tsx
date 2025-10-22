import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import SectionHeader from '../../common/section-header';

interface CourseHeaderProps {
  category: string[];
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function CourseHeader({
  category,
  currentCategory,
  setCurrentCategory,
  sortBy,
  setSortBy
}: CourseHeaderProps) {
  // 카테고리 한글 매핑 함수
  const getKoreanCategory = (categoryName: string) => {
    switch (categoryName) {
      case 'TOTAL':
        return '전체';
      case 'INTERVIEW':
        return '인터뷰';
      case 'RESUME':
        return '이력서';
      case 'NETWORKING':
        return '네트워킹';
      default:
        return categoryName;
    }
  };
  return (
    <>
      <SectionHeader
        subtitle="다양한 강의를 한 자리에서"
        title="페이스메이커 온라인 강의"
      />
      <div className="w-full flex gap-4 justify-between items-center pt-8 pb-4">
        <div className="flex gap-4">
          {category.map((categoryName) => (
            <Badge
              key={categoryName}
              variant={'outline'}
              data-testid={`category-badge-${categoryName}`}
              className={`${
                categoryName === currentCategory
                  ? ' border-pace-orange-600 text-pace-orange-600'
                  : 'text-pace-stone-600 border-pace-stone-600'
              } rounded-full w-full h-12 min-w-32 justify-center cursor-pointer !text-pace-base font-medium hover:text-pace-orange-600 hover:border-pace-orange-600`}
              onClick={() => {
                setCurrentCategory(categoryName);
              }}
            >
              {getKoreanCategory(categoryName)}
            </Badge>
          ))}
        </div>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-[112px] h-12 text-pace-stone-800 bg-white shadow-sm rounded-[40px]">
            <SelectValue placeholder="sort" />
          </SelectTrigger>
          <SelectContent className=" bg-white border-pace-gray-100">
            <SelectItem value="Total">Total</SelectItem>
            <SelectItem value="Date">Date</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
