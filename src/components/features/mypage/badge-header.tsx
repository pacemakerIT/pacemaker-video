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
      <div className="w-full flex gap-4 justify-between items-center pt-6 pb-4">
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
              } rounded-full w-full h-12 min-w-40 justify-center cursor-pointer !text-pace-base font-medium hover:text-pace-orange-600 hover:border-pace-orange-600`}
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
