'use client';

import { cn } from '@/lib/utils';

type AddButtonProps = {
  label: string;
  onClick?: () => void;
  className?: string;
};

export default function AddButton({
  label,
  onClick,
  className
}: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'self-end border border-pace-gray-200 rounded px-4 py-2 text-pace-stone-500 text-pace-base flex items-center gap-2 bg-pace-stone-100',
        className
      )}
    >
      {label} <span className="text-pace-lg">＋</span>
    </button>
  );
}
