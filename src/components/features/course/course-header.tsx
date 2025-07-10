import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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
  return (
    <>
      <div className="flex flex-col justify-start w-full pt-20">
        <h5 className="text-pace-orange-600 text-lg">
          {'다양한 강의를 한 자리에서'}
        </h5>
        <h3 className="text-pace-black-500 text-pace-3xl font-bold">
          {'페이스메이커 온라인 강의'}
        </h3>
      </div>
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
              } rounded-full w-full h-12 min-w-40 justify-center cursor-pointer font-medium hover:text-pace-orange-600 hover:border-pace-orange-600`}
              onClick={() => {
                setCurrentCategory(categoryName);
              }}
            >
              {categoryName}
            </Badge>
          ))}
        </div>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-[112px] h-12 text-pace-stone-800 bg-white shadow-sm rounded-[40px]">
            <SelectValue placeholder="sort" />
          </SelectTrigger>
          <SelectContent className=" bg-white border-[#EEEEEE]">
            <SelectItem value="Total">Total</SelectItem>
            <SelectItem value="Date">Date</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
