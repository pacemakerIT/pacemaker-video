'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import PaceSelect from '@/components/ui/admin/select';
import { itemCategoryLabel } from '@/constants/labels';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Row = {
  id: string;
  title: string;
  description: string;
  price: number;
  purchaseCount: number;
  likes: number;
  status: '공개중' | '비공개' | string;
  thumbnail: string;
  selected: boolean;
  category: string;
};

const CATEGORY_MAP = itemCategoryLabel.en;

// Sortable Row Component
function VisualRow({
  row,
  index,
  toggleRow
}: {
  row: Row;
  index: number;
  toggleRow: (id: string, checked: boolean) => void;
}) {
  const [value, setValue] = useState(
    row.status === '공개중' ? 'public' : 'private'
  );

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center border-b border-pace-gray-100 text-pace-base text-pace-gray-500 h-[138px] pl-7 gap-x-7"
    >
      {/* Checkbox */}
      <div className="w-8">
        <Checkbox
          checked={row.selected}
          onCheckedChange={(checked) => toggleRow(row.id, !!checked)}
          className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
        />
      </div>

      {/* Order */}
      <div className="w-8 text-pace-stone-500 text-pace-sm text-center">
        {index + 1}
      </div>

      {/* Category */}
      <div className="w-32 text-pace-stone-500 text-pace-sm text-center">
        {CATEGORY_MAP[row.category.toUpperCase()] || row.category}
      </div>

      {/* Thumbnail */}
      <div className="w-40 h-[106px] relative rounded overflow-hidden bg-gray-100">
        {/* Using a placeholder if thumbnail is empty or local path */}
        <Image
          src={row.thumbnail}
          alt={row.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Title & Description */}
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-medium text-pace-base pb-2 truncate">{row.title}</p>
        <p className="text-pace-sm text-pace-stone-500 pb-1 line-clamp-2 h-[40px] leading-[20px]">
          {row.description}
        </p>
        <div className="flex items-center gap-4 text-pace-sm text-pace-gray-700 mt-1">
          <span>
            금액{' '}
            <span className="font-semibold">${row.price.toLocaleString()}</span>
          </span>
          <span>
            찜 <span className="font-semibold">{row.likes}</span>
          </span>
          <span>
            구매 <span className="font-semibold">{row.purchaseCount}</span>
          </span>
        </div>
      </div>

      {/* Public Status */}
      <div className="w-32">
        <PaceSelect
          value={value}
          onChange={setValue}
          width="w-[124px]"
          options={[
            { value: 'public', label: '공개' },
            { value: 'private', label: '비공개' }
          ]}
          valueClassMap={{
            public: 'text-pace-gray-700 font-bold',
            private: 'text-pace-stone-500 font-normal',
            '': 'text-pace-stone-500 font-normal'
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pr-4">
        <div className="flex gap-2">
          {/* Edit Button */}
          <Link href={`/admin/ebooks/${row.id}`}>
            <button className="w-[76px] h-[44px] bg-pace-stone-500 !text-pace-base text-pace-white-500 rounded-[4px] flex items-center justify-center">
              수정
            </button>
          </Link>
          {/* Delete Button */}
          <button className="w-[76px] h-[44px] bg-pace-white-500 !text-pace-base text-pace-stone-500 border border-pace-stone-500 rounded-[4px] flex items-center justify-center">
            삭제
          </button>
        </div>

        {/* Drag Handle */}
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

export default function AdminEbooksPage() {
  const [categoryFilter, setCategoryFilter] = useState('TOTAL');

  // Mock Data
  const [rows, setRows] = useState<Row[]>([
    {
      id: '1',
      category: 'NETWORKING',
      thumbnail: '/img/course_image1.png', // Ensure this image exists, or use a placeholder
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '이것은 긴 설명 텍스트입니다. UI에서 2줄 이상이 되면 말줄임표(...)로 표시되어야 합니다. 확인을 위해 텍스트를 아주 길게 작성하고 있습니다. 강의 내용에 대한 상세한 설명이 여기에 들어갑니다. 사용자가 내용을 파악할 수 있도록 충분한 정보를 제공하지만, 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 아무랜덤 단어가 들어갑니다. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 리스트 뷰에서는 공간 절약을 위해 잘려서 보여야 합니다. 줄바꿈 처리가 잘 되는지 확인해 보세요. 줄바꿈 처리가 잘 되는지 확인해 보세요. 줄바꿈 처리가 잘 되는지 확인해 보세요. 줄바꿈 처리가 잘 되는지 확인해 보세요.',
      price: 999,
      purchaseCount: 123,
      likes: 999,
      status: '공개중',
      selected: true
    },
    {
      id: '2',
      category: 'NETWORKING',
      thumbnail: '/img/course_image1.png',
      title: '자기소개서 작성 및 면접 준비까지 하나로! (2)',
      description:
        '강의 내용입니다. 강의 내용입니다. 강의 내용입니다. 강의 내용입니다.',
      price: 999,
      purchaseCount: 123,
      likes: 999,
      status: '공개중',
      selected: true
    },
    {
      id: '3',
      category: 'NETWORKING',
      thumbnail: '/img/course_image1.png',
      title: '자기소개서 작성 및 면접 준비까지 하나로! (3)',
      description: '강의 내용입니다...',
      price: 999,
      purchaseCount: 123,
      likes: 999,
      status: '공개중',
      selected: true
    },
    {
      id: '4',
      category: 'NETWORKING',
      thumbnail: '/img/course_image1.png',
      title: '비공개 테스트 항목',
      description: '이것은 비공개 항목입니다.',
      price: 500,
      purchaseCount: 0,
      likes: 5,
      status: '비공개',
      selected: false
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const toggleRow = (id: string, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, selected: checked } : row))
    );
  };

  const toggleAll = (checked: boolean) => {
    setRows((prev) => prev.map((row) => ({ ...row, selected: checked })));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((row) => row.id === active.id);
      const newIndex = rows.findIndex((row) => row.id === over.id);
      setRows((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const filteredRows = rows.filter((row) => {
    if (categoryFilter === 'TOTAL') return true;
    return (
      CATEGORY_MAP[categoryFilter] === row.category ||
      row.category === categoryFilter
    );
  });

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">전자책 관리</h1>
        <div className="flex gap-2">
          <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
            저장
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            전자책 리스트
          </span>
        </div>

        {/* Filters */}
        <div className="pt-6 pb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              checked={rows.length > 0 && rows.every((row) => row.selected)}
              onCheckedChange={(checked) => toggleAll(!!checked)}
              className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
            />
            <span className="ml-2 text-pace-sm text-pace-gray-700">
              전체선택
            </span>
          </div>

          <PaceSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            width="w-[145px]"
            options={[
              { value: 'TOTAL', label: itemCategoryLabel.en.TOTAL },
              { value: 'INTERVIEW', label: itemCategoryLabel.en.INTERVIEW },
              { value: 'RESUME', label: itemCategoryLabel.en.RESUME },
              { value: 'NETWORKING', label: itemCategoryLabel.en.NETWORKING }
            ]}
          />
        </div>

        {/* Table Header */}
        <div className="w-full pb-7">
          <div className="flex items-center border-b border-t border-pace-gray-100 text-pace-base text-pace-gray-500 h-[56px] pl-7 gap-x-7 text-center">
            <div className="w-8">선택</div>
            <div className="w-8">순서</div>
            <div className="w-32">카테고리</div>
            <div className="w-40">썸네일</div>
            <div className="flex-1">제목</div>
            <div className="w-32">공개여부</div>
            <div className="w-48"></div> {/* Actions column spacer */}
          </div>

          {/* DND List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* 
              Important: SortableContext must know about the items currently being rendered.
              We pass the IDs of filteredRows to ensure physics work if we drag filtered items.
            */}
            <SortableContext
              items={filteredRows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredRows.map((row) => {
                const index = rows.findIndex((r) => r.id === row.id);

                return (
                  <VisualRow
                    key={row.id}
                    row={row}
                    index={index}
                    toggleRow={toggleRow}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 justify-end pb-6">
          <button className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center">
            삭제
          </button>

          <Link href="/admin/ebooks/new">
            <button className="w-[112px] h-[60px] bg-pace-gray-700 !text-pace-lg text-pace-white-500 rounded-[4px] flex items-center justify-center">
              추가
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
