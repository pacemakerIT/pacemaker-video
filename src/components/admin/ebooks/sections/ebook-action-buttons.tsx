'use client';

import Link from 'next/link';

type Props = {
  onSubmit: () => void;
  onPreview?: () => void;
  cancelHref?: string;
};

export default function EbookActionButtons({
  onSubmit,
  onPreview,
  cancelHref = '/admin/courses'
}: Props) {
  return (
    <div className="flex justify-between items-center border-t border-pace-gray-200 pt-10">
      {/* 왼쪽: TODO: 미리보기 - Course Database 구현 후 적용 필요 */}
      <button
        type="button"
        onClick={onPreview}
        className="w-[112px] h-[60px] border border-pace-gray-700 rounded text-pace-gray-700 hover:bg-pace-gray-50"
      >
        미리보기
      </button>

      {/* 오른쪽: 취소 / 등록 */}
      <div className="flex gap-3">
        <Link href={cancelHref}>
          <button
            type="button"
            className="w-[112px] h-[60px] border border-pace-gray-700 rounded text-pace-gray-700 hover:bg-pace-gray-50"
          >
            취소
          </button>
        </Link>
        <button
          type="button"
          onClick={onSubmit}
          className="w-[112px] h-[60px] rounded bg-pace-gray-700 text-white hover:bg-pace-gray-800"
        >
          수정
        </button>
      </div>
    </div>
  );
}
