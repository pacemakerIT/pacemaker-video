import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface EbookHeaderProps {
  category: string[];
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function EbookHeader({
  category,
  currentCategory,
  setCurrentCategory,
  sortBy,
  setSortBy
}: EbookHeaderProps) {
  // 카테고리 한글 매핑
  const getKoreanCategory = (categoryName: string) => {
    switch (categoryName) {
      case 'TOTAL':
        return '전체';
      case 'MARKETING':
        return '마케팅';
      case 'IT':
        return 'IT';
      case 'DESIGN':
        return '디자인';
      case 'PUBLIC':
        return '북미 공무원';
      case 'ACCOUNTING':
        return '재무회계';
      default:
        return categoryName;
    }
  };

  return (
    <>
      {/* 타이틀 */}
      <div className="flex flex-col justify-start w-full">
        <h5 className="text-pace-orange-600 text-lg">
          {'필요한 정보만 쏙쏙 골라보는'}
        </h5>
        <h3 className="text-pace-black-500 text-pace-3xl font-bold">
          {'페이스메이커 전자책'}
        </h3>
      </div>

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
              {getKoreanCategory(categoryName)}
            </Badge>
          ))}
        </div>

        {/* 정렬 */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-[112px] h-12 text-pace-stone-800 bg-white shadow-sm rounded-[40px]">
            <SelectValue placeholder="sort" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#EEEEEE]">
            <SelectItem value="Total">Total</SelectItem>
            <SelectItem value="Date">Date</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
