'use client';

import React from 'react';
import { WorkshopStatus } from '@/types/workshops';
import { calendarStyleMap } from '@/components/ui/calendar-style-map';

type FilterKey = '전체' | WorkshopStatus;

interface WorkshopFilterProps {
  selected: FilterKey;
  onChange: (status: FilterKey) => void;
}

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: '전체', value: '전체' },
  { label: '모집중', value: WorkshopStatus.RECRUITING },
  { label: '모집완료', value: WorkshopStatus.CLOSED },
  { label: '진행중', value: WorkshopStatus.ONGOING },
  { label: '진행완료', value: WorkshopStatus.COMPLETED }
];

const getSelectedStyle = (status: FilterKey) => {
  if (status === '전체') {
    return {
      text: 'text-pace-orange-500',
      border: 'border-pace-orange-500',
      bg: 'bg-white'
    };
  }

  const style = calendarStyleMap[status];
  return {
    text: style.text,
    border: style.border,
    bg: 'bg-white'
  };
};

const getHoverStyle = (status: FilterKey) => {
  if (status === '전체') {
    return 'hover:text-pace-orange-500 hover:border-pace-orange-500';
  }

  const style = calendarStyleMap[status];
  return `hover:${style.text} hover:${style.border}`;
};

export default function WorkshopFilter({
  selected,
  onChange
}: WorkshopFilterProps) {
  return (
    <div className="w-full max-w-[1200px] flex items-center gap-3 pt-8 pb-8">
      {FILTERS.map(({ label, value }) => {
        const isSelected = selected === value;
        const selectedStyle = getSelectedStyle(value);
        const hoverStyle = getHoverStyle(value);

        return (
          <button
            key={label}
            onClick={() => onChange(value)}
            className={`w-[120px] h-[48px] px-[14px] pr-[15px] py-[12px]
              rounded-full border text-pace-base font-medium
              transition-all duration-150
              flex items-center justify-center
              ${
                isSelected
                  ? `${selectedStyle.text} ${selectedStyle.border} ${selectedStyle.bg}`
                  : `text-pace-stone-600 border-pace-stone-600 bg-white ${hoverStyle}`
              }`}
          >
            {label}
          </button>
        );
      })}
      {/* purge 방지용 hidden hover 클래스 (진행중/진행완료 hover 색 유지) */}
      <div className="hidden hover:text-pace-mint-500 hover:border-pace-mint-500 hover:text-pace-stone-800 hover:border-pace-stone-800" />
    </div>
  );
}
