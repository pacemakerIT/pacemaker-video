'use client';

import Link from 'next/link';
import React from 'react';

type Props = {
  onPreview?: () => void;
  onSubmit?: () => void;
  cancelHref?: string;
  submitLabel?: string;
  submitBehavior?: 'submit' | 'callback';
};

export default function ActionButtons({
  onPreview,
  onSubmit,
  cancelHref = '/',
  submitLabel = '등록',
  submitBehavior = 'submit'
}: Props) {
  const renderSubmit = () => {
    if (submitBehavior === 'callback') {
      return (
        <button
          type="button"
          onClick={onSubmit}
          className="w-[112px] h-[60px] rounded bg-pace-gray-700 text-white hover:bg-pace-gray-800"
        >
          {submitLabel}
        </button>
      );
    }

    return (
      <button
        type="submit"
        className="w-[112px] h-[60px] rounded bg-pace-gray-700 text-white hover:bg-pace-gray-800"
      >
        {submitLabel}
      </button>
    );
  };

  return (
    <div className="flex justify-between items-center border-t border-pace-gray-200 pt-10">
      <button
        type="button"
        onClick={onPreview}
        className="w-[112px] h-[60px] border border-pace-gray-700 rounded text-pace-gray-700 hover:bg-pace-gray-50"
      >
        미리보기
      </button>

      <div className="flex gap-3">
        <Link href={cancelHref}>
          <button
            type="button"
            className="w-[112px] h-[60px] border border-pace-gray-700 rounded text-pace-gray-700 hover:bg-pace-gray-50"
          >
            취소
          </button>
        </Link>
        {renderSubmit()}
      </div>
    </div>
  );
}
