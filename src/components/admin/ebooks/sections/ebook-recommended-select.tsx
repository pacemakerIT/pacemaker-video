'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/admin/checkbox';
import RequiredMark from '@/components/ui/admin/required-mark';

type RecommendedSelectProps = {
  maxSelect?: number;
  value?: string[];
  onChange?: (selected: string[]) => void;
};

export default function EbookRecommendedSelect({
  maxSelect = 2,
  value,
  onChange,
  error
}: RecommendedSelectProps & { error?: string }) {
  const options = [
    'IT 개발',
    '공무원',
    '재무회계',
    '디자인',
    '북미 취업이력서',
    '인터뷰 준비',
    '네트워킹',
    '서비스'
  ];

  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const effectiveSelected = value !== undefined ? value : localSelected;

  const handleSelect = (option: string) => {
    let updated: string[] = [];
    if (effectiveSelected.includes(option)) {
      updated = effectiveSelected.filter((item) => item !== option);
    } else {
      if (effectiveSelected.length >= maxSelect) {
        alert(`최대 ${maxSelect}개까지만 선택 가능합니다.`);
        return;
      }
      updated = [...effectiveSelected, option];
    }

    if (value === undefined) {
      setLocalSelected(updated);
    }
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start items-center gap-6">
        {/* 라벨 */}
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          추천드려요 이미지 선택
          <RequiredMark />
        </label>

        {/* 체크박스 리스트 */}
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Checkbox
              checked={effectiveSelected.includes(option)}
              onCheckedChange={() => handleSelect(option)}
              className="w-6 h-6"
            />
            <span className="text-pace-base text-pace-stone-500">{option}</span>
          </label>
        ))}

        {/* 안내 문구 */}
        <span className="text-pace-orange-500 pace-text-sm whitespace-nowrap">
          * 최대 2개까지 선택 가능
        </span>
      </div>
      {error && (
        <div className="pl-[240px]">
          <p className="text-pace-orange-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
