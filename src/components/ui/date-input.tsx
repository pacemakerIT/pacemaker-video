'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Image from 'next/image';

type DateInputProps = {
  placeholder?: string;
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
};

export default function DateInput({
  placeholder = '날짜 선택',
  value,
  onChange
}: DateInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-[240px]">
      {/* input + 아이콘 */}
      <div
        className="flex items-center border border-pace-gray-300 rounded bg-white cursor-pointer"
        onClick={() => setOpen((prev) => !prev)} // 전체 클릭 가능
      >
        <input
          type="text"
          value={value ? format(value, 'yyyy-MM-dd') : ''}
          placeholder={placeholder}
          readOnly
          className="w-full rounded p-3 pr-10 text-pace-base cursor-pointer"
        />
        <Image
          src="/icons/calendar.svg"
          alt="calendar"
          width={20}
          height={20}
          className="mx-3 pointer-events-none"
        />
      </div>

      {/* DayPicker 팝업 */}
      {open && (
        <div className="absolute top-[110%] left-0 bg-white border rounded shadow-lg z-10">
          <DayPicker
            mode="single"
            selected={value || undefined}
            onSelect={(day) => {
              if (!day) return;
              onChange?.(day);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
