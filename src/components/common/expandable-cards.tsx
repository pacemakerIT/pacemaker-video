'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableCardProps {
  items: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
  itemClassName?: string;
  titleClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
  contentClassName?: string;
  onDelete?: (id: string) => void;
}

export default function ExpandableCards({
  items,
  expandLabel = 'Read',
  collapseLabel = 'Close',
  className,
  itemClassName,
  titleClassName,
  labelClassName,
  iconClassName,
  contentClassName,
  onDelete
}: ExpandableCardProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div
      className={cn(
        isAdmin ? 'w-full' : 'w-full lg:w-[40%]',
        'max-w-4xl mx-auto',
        className
      )}
    >
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'bg-gray-50 rounded-none border border-gray-200 overflow-hidden',
              itemClassName
            )}
          >
            <div className="w-full p-3.5 sm:p-6 flex items-center justify-between transition-colors hover:bg-gray-100 cursor-pointer">
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex-1 text-left flex items-center justify-between min-w-0 mr-2 sm:mr-4 gap-2"
              >
                <span
                  className={cn(
                    'text-base sm:text-lg font-bold text-navy flex-1 min-w-0 pr-2 leading-snug',
                    titleClassName
                  )}
                >
                  {item.title}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-gray-500 shrink-0 whitespace-nowrap',
                    labelClassName
                  )}
                >
                  <span className="text-xs sm:text-sm">
                    {expandedItems.has(item.id) ? collapseLabel : expandLabel}
                  </span>
                  {expandedItems.has(item.id) ? (
                    <ChevronUp
                      className={cn('w-4 h-4 sm:w-5 sm:h-5', iconClassName)}
                    />
                  ) : (
                    <ChevronDown
                      className={cn('w-4 h-4 sm:w-5 sm:h-5', iconClassName)}
                    />
                  )}
                </div>
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="text-pace-sm text-pace-orange-500 hover:text-pace-orange-700 font-medium px-2 py-1 shrink-0"
                >
                  삭제
                </button>
              )}
            </div>
            {expandedItems.has(item.id) && (
              <div
                className={cn(
                  'bg-white border-t border-gray-200 px-3.5 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4',
                  contentClassName
                )}
              >
                <div className="text-gray-500 leading-relaxed overflow-hidden">
                  {item.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
