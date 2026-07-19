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
  { label: 'Open', value: WorkshopStatus.RECRUITING },
  { label: 'Closed', value: WorkshopStatus.CLOSED },
  { label: 'Ongoing', value: WorkshopStatus.ONGOING },
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

  if (status === WorkshopStatus.RECRUITING) {
    return {
      text: 'text-[#FF4F02]',
      border: 'border-[#FF4F02]',
      bg: 'bg-[#FF4F02]/[0.03]'
    };
  }

  if (status === WorkshopStatus.CLOSED || status === WorkshopStatus.ONGOING) {
    return {
      text: 'text-teal-600',
      border: 'border-teal-600',
      bg: 'bg-teal-50'
    };
  }

  return {
    text: 'text-gray-500',
    border: 'border-gray-500',
    bg: 'bg-gray-50'
  };
};

const getHoverStyle = (status: FilterKey) => {
  if (status === 'All' || status === WorkshopStatus.RECRUITING) {
    return 'hover:text-[#FF4F02] hover:border-[#FF4F02]';
  }

  if (status === WorkshopStatus.CLOSED || status === WorkshopStatus.ONGOING) {
    return 'hover:text-teal-600 hover:border-teal-600';
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
      {/* purge 방지용 hidden hover 클래스 (진행중/진행완료 hover 색 유지) */}
      <div className="hidden border-[#FF4F02] bg-[#FF4F02]/[0.03] text-[#FF4F02] hover:border-[#FF4F02] hover:border-teal-600 hover:text-[#FF4F02] hover:text-teal-600" />
    </div>
  );
}
