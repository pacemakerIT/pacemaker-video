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
      text: 'text-[#FF4F02]',
      border: 'border-[#FF4F02]',
      bg: 'bg-[#FF4F02]/[0.03]'
    };
  }

  if (status === WorkshopStatus.CLOSED) {
    return {
      text: 'text-[#0D9488]',
      border: 'border-[#0D9488]',
      bg: 'bg-[#0D9488]/[0.03]'
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
    return 'hover:text-[#FF4F02] hover:border-[#FF4F02]';
  }

  if (status === WorkshopStatus.CLOSED) {
    return 'hover:text-[#0D9488] hover:border-[#0D9488]';
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
            className={`flex h-[32px] shrink-0 items-center justify-center rounded-xl border px-4
              font-headline text-[12px] font-medium
              transition-colors md:h-[40px] md:rounded-2xl md:px-6 md:text-[14px]
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
      <div className="hidden border-[#0D9488] border-[#FF4F02] bg-[#0D9488]/[0.03] bg-[#FF4F02]/[0.03] text-[#0D9488] text-[#FF4F02] hover:border-[#0D9488] hover:border-[#FF4F02] hover:text-[#0D9488] hover:text-[#FF4F02]" />
    </div>
  );
}
