'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

type ImageUploadInputProps = {
  placeholder?: string;
  value?: File | null; // 새로 업로드한 파일
  imageUrl?: string; // 기존 이미지 URL (수정 페이지에서 내려줌)
  onChange?: (file: File | null) => void;
};

export default function ImageUploadInput({
  placeholder = '이미지 업로드',
  value,
  imageUrl,
  onChange
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // props는 수정할 수 없으므로 내부에서 따로 상태로 관리
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(
    imageUrl || null
  );

  // 파일이 바뀔 때마다 미리보기 생성
  useEffect(() => {
    if (value) {
      // 새 파일이 선택된 경우 → objectURL 생성
      const url = URL.createObjectURL(value);
      setPreview(url);
      setLocalImageUrl(null); // 새 파일 선택 시 기존 이미지 제거
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [value]);

  // 파일 선택 시
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange?.(file);
  };

  // 파일 제거 시
  const handleRemove = () => {
    onChange?.(null); // 부모에게도 null 전달
    setPreview(null);
    setLocalImageUrl(null); // 기존 이미지도 제거

    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // input 초기화
    }
  };

  return (
    <div className="w-full">
      {/* 업로드 전 + 기존 이미지 없음 */}
      {!value && !localImageUrl ? (
        <div
          className="flex items-center border border-pace-gray-300 rounded bg-white cursor-pointer w-full h-[48px]"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="flex-1 px-3 text-pace-base text-pace-stone-800 truncate">
            {placeholder}
          </span>
          <Image
            src="/icons/upload.svg"
            alt="upload"
            width={20}
            height={20}
            className="mx-3 pointer-events-none"
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        // 업로드 후 or 기존 이미지 표시
        <div className="flex items-center bg-white p-2 gap-3">
          {/* 썸네일 (새 파일 있으면 preview, 없으면 기존 imageUrl) */}
          {(preview && preview !== '') ||
          (localImageUrl && localImageUrl !== '') ? (
            <Image
              src={preview || localImageUrl!}
              alt="preview"
              width={159}
              height={106}
              className="rounded object-cover border border-pace-gray-200"
            />
          ) : null}
          {/* 파일명 or 기존 이미지 텍스트 */}
          <span className="flex-1 text-pace-sm text-pace-gray-700 truncate">
            {value ? value.name : '기존 이미지'}
          </span>
          {/* X 버튼 (누르면 업로드/기존 이미지 제거) */}
          <button
            type="button"
            onClick={handleRemove}
            className="text-pace-stone-500 hover:text-pace-gray-900"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
