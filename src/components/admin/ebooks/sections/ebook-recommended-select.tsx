'use client';

import { useState } from 'react';
import { TargetAudienceType } from '@prisma/client';
import { Checkbox } from '@/components/ui/admin/checkbox';
import RequiredMark from '@/components/ui/admin/required-mark';

type RecommendedSelectProps = {
  maxSelect?: number;
  value?: TargetAudienceType[];
  onChange?: (selected: TargetAudienceType[]) => void;
};

export default function EbookRecommendedSelect({
  maxSelect = 2,
  value,
  onChange,
  error
}: RecommendedSelectProps & { error?: string }) {
  const options: { value: TargetAudienceType; label: string }[] = [
    { value: TargetAudienceType.IT, label: 'IT 개발' },
    { value: TargetAudienceType.GOVERNMENT, label: '공무원' },
    { value: TargetAudienceType.FINANCE, label: '재무회계' },
    { value: TargetAudienceType.DESIGN, label: '디자인' },
    { value: TargetAudienceType.RESUME, label: '북미 취업이력서' },
    { value: TargetAudienceType.INTERVIEW, label: '인터뷰 준비' },
    { value: TargetAudienceType.NETWORKING, label: '네트워킹' },
    { value: TargetAudienceType.SERVICE, label: '서비스' }
  ];

  const [localSelected, setLocalSelected] = useState<TargetAudienceType[]>([]);
  const effectiveSelected = value !== undefined ? value : localSelected;

  const handleSelect = (option: TargetAudienceType) => {
    let updated: TargetAudienceType[] = [];
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
