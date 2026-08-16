import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { itemCategoryLabel } from '@/constants/labels';

interface CourseHeaderProps {
  category: string[];
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const categoryColors: Record<string, string> = {
  TOTAL: '#FF4F02',
  INTERVIEW: 'rgb(54, 166, 247)',
  RESUME: 'rgb(255, 150, 49)',
  NETWORKING: 'rgb(159, 91, 231)'
};

export default function CourseHeader({
  category,
  currentCategory,
  setCurrentCategory,
  sortBy,
  setSortBy
}: CourseHeaderProps) {
  const getDisplayCategory = (categoryName: string) => {
    if (categoryName.toUpperCase() === 'TOTAL') return 'All';
    return itemCategoryLabel.en[categoryName.toUpperCase()] || categoryName;
  };

  return (
    <>
      <div className="w-full mb-8">
        <p className="text-[#FF4F02] font-bold font-body text-[18px] tracking-wide mb-2">
          Explore Our Programs
        </p>
        <h2 className="text-[32px] font-extrabold text-[#00263B] tracking-tight font-headline">
          Pacemaker online courses
        </h2>
      </div>

      <div className="w-full flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div
          className="flex flex-wrap gap-3"
          role="tablist"
          aria-label="Course filters"
        >
          {category.map((categoryName) => {
            const color =
              categoryColors[categoryName.toUpperCase()] ?? '#FF4F02';
            const isActive = categoryName === currentCategory;
            return (
              <button
                key={categoryName}
                type="button"
                role="tab"
                aria-pressed={isActive}
                data-testid={`category-badge-${categoryName}`}
                onClick={() => setCurrentCategory(categoryName)}
                style={
                  isActive
                    ? {
                        borderColor: color,
                        color,
                        boxShadow: `0 10px 25px -5px ${color}33`
                      }
                    : undefined
                }
                className="inline-flex items-center justify-center min-w-[110px] px-6 py-3 border border-[#d0d5dd] rounded-2xl bg-white text-[#667085] text-base leading-none font-medium font-headline transition-all duration-300 hover:border-current cursor-pointer"
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      color;
                    (e.currentTarget as HTMLButtonElement).style.color = color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      '';
                    (e.currentTarget as HTMLButtonElement).style.color = '';
                  }
                }}
              >
                {getDisplayCategory(categoryName)}
              </button>
            );
          })}
        </div>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-auto h-12 pl-5 pr-4 gap-8 text-base font-medium font-headline leading-none text-[#667085] bg-white rounded-2xl border-[#eaecf0] shadow-[0_4px_12px_rgba(0,38,59,0.08)]">
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
