'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableCardProps {
  items: {
    id: string;
    title: string;
    content: string;
  }[];
}

export default function ExpandableCards({ items }: ExpandableCardProps) {
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-pace-ivory-500 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-200 hover:scale-[1.02]"
            >
              <span className="text-lg font-semibold text-gray-900">
                {item.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {expandedItems.has(item.id) ? 'Close' : 'Read'}
                </span>
                {expandedItems.has(item.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>
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
