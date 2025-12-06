'use client';
import { useState } from 'react';
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
  onDelete?: (id: string) => void;
}

export default function ExpandableCards({
  items,
  expandLabel = 'Read',
  collapseLabel = 'Close',
  className,
  onDelete
}: ExpandableCardProps) {
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
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-pace-ivory-500 rounded-lg overflow-hidden"
          >
            <div className="w-full px-6 py-4 flex items-center justify-between transition-all duration-200 hover:scale-[1.02]">
              <button
                onClick={() => toggleItem(item.id)}
                className="flex-1 text-left flex items-center justify-between mr-4"
              >
                <span className="text-lg font-semibold text-gray-900">
                  {item.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {expandedItems.has(item.id) ? collapseLabel : expandLabel}
                  </span>
                  {expandedItems.has(item.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="text-pace-sm text-pace-orange-500 hover:text-pace-orange-700 font-medium px-2 py-1"
                >
                  삭제
                </button>
              )}
            </div>
            {expandedItems.has(item.id) && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <div className="pt-4 text-gray-700 leading-relaxed">
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
