import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { resolveImageSrc } from '@/lib/utils';

export type RowLike = {
  id: string;
  title?: string;
  description?: string;
  price?: number | string;
  likes?: number;
  purchaseCount?: number;
  purchases?: number;
  status?: string;
  thumbnail?: string | null;
  selected?: boolean;
  category?: string;
  orderKey?: string | null;
};

type AdminVisualRowProps = {
  row: RowLike;
  index: number;
  toggleRow: (id: string, checked: boolean, newStatus?: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  StatusComponent?: React.ComponentType<{
    row: RowLike;
    toggleRow: (id: string, checked: boolean, newStatus?: string) => void;
    onStatusChange?: (id: string, newStatus: string) => void;
  }>;
  editHref?: string;
  attemptNavigation?: (url: string) => void;
  categoryLabel?: (category?: string) => string;
  resolveThumbnail?: (row: RowLike) => string;
};

export default function AdminVisualRow({
  row,
  index,
  toggleRow,
  onDelete,
  onStatusChange,
  StatusComponent,
  editHref,
  attemptNavigation,
  categoryLabel,
  resolveThumbnail
}: AdminVisualRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const thumbnailSrc = resolveThumbnail ? resolveThumbnail(row) : row.thumbnail;
  const resolvedThumbnailSrc = resolveImageSrc({ thumbnail: thumbnailSrc });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center border-b border-pace-gray-100 text-pace-base text-pace-gray-500 h-[138px] pl-7 gap-x-7"
    >
      <div className="w-8">
        <Checkbox
          checked={row.selected}
          onCheckedChange={(checked) => toggleRow(row.id, !!checked)}
          className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
        />
      </div>

      <div className="w-8 text-pace-stone-500 text-pace-sm text-center">
        {index + 1}
      </div>

      <div className="w-32 text-pace-stone-500 text-pace-sm text-center">
        {categoryLabel ? categoryLabel(row.category) : row.category}
      </div>

      <div className="w-40 h-[106px] relative rounded overflow-hidden bg-gray-100">
        {resolvedThumbnailSrc ? (
          <Image
            src={resolvedThumbnailSrc}
            alt={row.title ?? ''}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p className="font-medium text-pace-base pb-2 truncate">{row.title}</p>
        <p className="text-pace-sm text-pace-stone-500 pb-1 line-clamp-2 h-[40px] leading-[20px]">
          {row.description}
        </p>
        <div className="flex items-center gap-4 text-pace-sm text-pace-gray-700 mt-1">
          <span>
            금액
            <span className="font-semibold">
              {row.price?.toLocaleString
                ? `$${row.price.toLocaleString()}`
                : row.price}
            </span>
          </span>
          <span>
            찜 <span className="font-semibold">{row.likes ?? 0}</span>
          </span>
          <span>
            구매
            <span className="font-semibold">
              {row.purchaseCount ?? row.purchases ?? 0}
            </span>
          </span>
        </div>
      </div>

      <div className="w-32">
        {StatusComponent ? (
          <StatusComponent
            row={row}
            toggleRow={toggleRow}
            onStatusChange={onStatusChange}
          />
        ) : null}
      </div>

      <div className="flex items-center gap-6 pr-4">
        <div className="flex gap-2">
          <Link
            href={editHref || '#'}
            onClick={(e) => {
              if (attemptNavigation && editHref) {
                e.preventDefault();
                attemptNavigation(editHref);
              }
            }}
          >
            <button className="w-[76px] h-[44px] bg-pace-stone-500 !text-pace-base text-pace-white-500 rounded-[4px] flex items-center justify-center">
              수정
            </button>
          </Link>
          <button
            onClick={() => onDelete?.(row.id)}
            className="w-[76px] h-[44px] bg-pace-white-500 !text-pace-base text-pace-stone-500 border border-pace-stone-500 rounded-[4px] flex items-center justify-center hover:bg-gray-50"
          >
            삭제
          </button>
        </div>

        <span
          {...listeners}
          className="cursor-move flex items-center p-2 hover:bg-gray-100 rounded"
        >
          <Image
            src="/icons/menu.svg"
            alt="drag handle"
            width={24}
            height={24}
            unoptimized
            className="cursor-move w-6 h-6"
          />
        </span>
      </div>
    </div>
  );
}
