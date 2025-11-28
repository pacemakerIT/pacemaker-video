'use client';

import { useState } from 'react';
import Image from 'next/image';

type TimeInputProps = {
  placeholder?: string;
  value?: string; // "HH:mm" 형식
  onChange?: (time: string) => void;
};

export default function TimeInput({
  placeholder = '시간 선택',
  value,
  onChange
}: TimeInputProps) {
  const [open, setOpen] = useState(false);

  // 시간을 00~23, 00~59로 생성
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  const handleSelect = (h: string, m: string) => {
    const newTime = `${h}:${m}`;
    onChange?.(newTime);
    setOpen(false);
  };

  return (
    <div className="relative w-[240px]">
      {/* input + 아이콘 */}
      <div
        className="flex items-center border border-pace-gray-300 rounded bg-white cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <input
          type="text"
          value={value || ''}
          placeholder={placeholder}
          readOnly
          className="w-full rounded p-3 pr-10 text-pace-base cursor-pointer"
        />
        <Image
          src="/icons/clock.svg"
          alt="clock"
          width={20}
          height={20}
          className="mx-3 pointer-events-none"
        />
      </div>

      {/* 커스텀 팝업 */}
      {open && (
        <div className="absolute top-[110%] left-0 bg-white border rounded shadow-lg z-10 p-3 flex gap-2">
          {/* 시 */}
          <div className="max-h-[200px] overflow-y-auto border-r pr-2">
            {hours.map((h) => (
              <div
                key={h}
                onClick={() => handleSelect(h, value?.split(':')[1] || '00')}
                className="px-2 py-1 cursor-pointer hover:bg-pace-gray-100"
              >
                {h}
              </div>
            ))}
          </div>

          {/* 분 */}
          <div className="max-h-[200px] overflow-y-auto">
            {minutes.map((m) => (
              <div
                key={m}
                onClick={() => handleSelect(value?.split(':')[0] || '00', m)}
                className="px-2 py-1 cursor-pointer hover:bg-pace-gray-100"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
