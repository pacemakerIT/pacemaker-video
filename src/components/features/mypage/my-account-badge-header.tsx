import { Badge } from '@/components/ui/badge';

interface BadgeHeaderProps {
  category: string[];
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
}

export default function BadgeHeader({
  category,
  currentCategory,
  setCurrentCategory
}: BadgeHeaderProps) {
  return (
    <>
      <div className="mb-6 flex w-full flex-wrap gap-3">
        <div className="flex flex-wrap gap-3">
          {category.map((categoryName) => (
            <Badge
              key={categoryName}
              variant={'outline'}
              data-testid={`category-badge-${categoryName}`}
              aria-pressed={categoryName === currentCategory}
              className={`${
                categoryName === currentCategory
                  ? categoryName === 'In progress' ||
                    categoryName === 'Upcoming'
                    ? 'border-[#00ADBD] bg-[#00ADBD] text-white'
                    : categoryName === 'Completed'
                      ? 'border-[#00263B] bg-[#00263B] text-white'
                      : 'border-[#FF4F02] bg-[#FF4F02] text-white'
                  : 'border-[#98A2B3] bg-white text-[#475467] hover:border-[#FF4F02] hover:text-[#FF4F02]'
              } h-8 min-w-0 cursor-pointer justify-center rounded-xl px-4 text-xs font-bold transition-colors sm:h-10 sm:min-w-[110px] sm:rounded-2xl sm:px-6 sm:text-sm`}
              onClick={() => {
                setCurrentCategory(categoryName);
              }}
            >
              {categoryName}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}
