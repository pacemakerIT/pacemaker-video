'use client';

import React from 'react';
import { WorkshopStatus } from '@/types/workshops';

type FilterKey = 'All' | WorkshopStatus;

interface WorkshopFilterProps {
  selected: FilterKey;
  onChange: (status: FilterKey) => void;
}

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: 'All', value: 'All' },
  { label: 'Open', value: WorkshopStatus.OPEN },
  { label: 'Closed', value: WorkshopStatus.CLOSED },
  { label: 'Completed', value: WorkshopStatus.COMPLETED }
];

const getSelectedStyle = (status: FilterKey) => {
  if (status === 'All') {
    return {
      text: 'text-[#FF4F02]',
      border: 'border-[#FF4F02]',
      bg: 'bg-[#FF4F02]/[0.03]'
    };
  }

  if (status === WorkshopStatus.OPEN) {
    return {
      text: 'text-orange',
      border: 'border-orange',
      bg: 'bg-orange/5'
    };
  }

  if (status === WorkshopStatus.CLOSED) {
    return {
      text: 'text-teal',
      border: 'border-teal',
      bg: 'bg-teal/5'
    };
  }

  return {
    text: 'text-gray-500',
    border: 'border-gray-500',
    bg: 'bg-gray-50'
  };
};

const getHoverStyle = (status: FilterKey) => {
  if (status === 'All' || status === WorkshopStatus.OPEN) {
    return 'hover:text-orange hover:border-orange';
  }

  if (status === WorkshopStatus.CLOSED) {
    return 'hover:text-teal hover:border-teal';
  }

  return 'hover:text-gray-500 hover:border-gray-500';
};

export default function WorkshopFilter({
  selected,
  onChange
}: WorkshopFilterProps) {
  return (
    <div className="mb-8 flex w-full flex-nowrap justify-start gap-[10px] overflow-x-auto pb-2 md:flex-wrap md:overflow-x-visible md:pb-0">
      {FILTERS.map(({ label, value }) => {
        const isSelected = selected === value;
        const selectedStyle = getSelectedStyle(value);
        const hoverStyle = getHoverStyle(value);

        return (
          <button
            key={label}
            onClick={() => onChange(value)}
            className={`flex h-[32px] shrink-0 items-center justify-center rounded-[40px] border px-4
              font-headline text-[12px] font-medium
              transition-colors md:h-[40px] md:px-6 md:text-[14px]
              ${
                isSelected
                  ? `${selectedStyle.text} ${selectedStyle.border} ${selectedStyle.bg}`
                  : `border-gray-300 bg-white text-gray-600 ${hoverStyle}`
              }`}
          >
            {label}
          </button>
        );
      })}
      {/* purge 방지용 hidden hover 클래스 (상태별 hover 색 유지) */}
      <div className="hidden border-[#FF4F02] border-orange border-teal bg-[#FF4F02]/[0.03] bg-orange/5 bg-teal/5 text-[#FF4F02] text-orange text-teal hover:border-orange hover:border-teal hover:text-orange hover:text-teal" />
    </div>
  );
}
