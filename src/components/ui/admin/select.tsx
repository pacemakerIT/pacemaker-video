'use client';

import {
  Select as ShadSelect,
  SelectTrigger,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

type Option = {
  label: string;
  value: string;
};

type PaceSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  width?: string;
  className?: string;

  /** value마다 스타일 다르게 주기 위한 맵 */
  valueClassMap?: Record<string, string>;
  disabled?: boolean;
};

export default function PaceSelect({
  value,
  onChange,
  options,
  placeholder = '선택',
  width = 'w-[216px]',
  className = '',
  valueClassMap = {}, // 기본값
  disabled = false
}: PaceSelectProps) {
  // 현재 value에 해당하는 스타일 찾기
  const appliedClass =
    valueClassMap[value] ??
    (value === '' // 아무것도 선택 안함
      ? 'text-pace-stone-500 font-normal'
      : 'text-pace-gray-700 font-medium'); // 기본

  return (
    <ShadSelect value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={`${width} h-[48px] px-3 border border-gray-300 rounded bg-white !text-pace-base ${className}`}
      >
        <span className={appliedClass}>
          {value === ''
            ? placeholder
            : options.find((o) => o.value === value)?.label}
        </span>
      </SelectTrigger>

      <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md !text-pace-base">
        {options.map((opt) => {
          const optionClass =
            valueClassMap[opt.value] ?? 'text-pace-gray-700 font-normal';

          return (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className={`!text-pace-base ${optionClass}`}
            >
              {opt.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </ShadSelect>
  );
}
