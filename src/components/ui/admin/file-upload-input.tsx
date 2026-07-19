'use client';

import { useRef } from 'react';
import { Paperclip } from 'lucide-react';

type FileUploadInputProps = {
  placeholder?: string;
  fileUrl?: string;
  fileName?: string;
  onChange?: (file: File | null) => void;
};

export default function FileUploadInput({
  placeholder = '파일 선택',
  fileUrl,
  fileName,
  onChange
}: FileUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = fileName || (fileUrl ? fileUrl.split('/').pop() : null);
  const hasFile = !!displayName;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange?.(file);
  };

  const handleRemove = () => {
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!hasFile ? (
        <div
          className="flex items-center border border-pace-gray-300 rounded bg-white cursor-pointer w-full h-[48px]"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="flex-1 px-3 text-pace-base text-pace-stone-800 truncate">
            {placeholder}
          </span>
          <Paperclip
            size={20}
            className="mx-3 text-pace-gray-500 pointer-events-none"
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="flex items-center border border-pace-gray-300 rounded bg-white px-3 h-[48px] gap-3">
          <Paperclip size={16} className="text-pace-gray-500 flex-shrink-0" />
          <span className="flex-1 text-pace-sm text-pace-gray-700 truncate">
            {displayName}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-pace-stone-500 hover:text-pace-gray-900 flex-shrink-0"
          >
            ✕
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}
