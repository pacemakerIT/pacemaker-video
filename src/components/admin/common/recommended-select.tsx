'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/admin/checkbox';
import RequiredMark from '@/components/ui/admin/required-mark';

type Option = { value: string; label: string };

type RecommendedSelectProps = {
  maxSelect?: number;
  value?: string[];
  onChange?: (selected: string[]) => void;
  options?: Option[];
};

/* TODO: enum으로 관리해서 recomment-auth db랑 연결하는 id로 쓰기 */
const DEFAULT_OPTIONS: Option[] = [
  'IT 개발',
  '공무원',
  '재무회계',
  '디자인',
  '북미 취업이력서',
  '인터뷰 준비',
  '네트워킹',
  '서비스'
].map((label) => ({ value: label, label }));

export default function RecommendedSelect({
  maxSelect = 2,
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  error
}: RecommendedSelectProps & { error?: string }) {
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
            key={option.value}
            className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Checkbox
              checked={effectiveSelected.includes(option.value)}
              onCheckedChange={() => handleSelect(option.value)}
              className="w-6 h-6"
            />
            <span className="text-pace-base text-pace-stone-500">
              {option.label}
            </span>
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
