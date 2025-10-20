'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

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
  id: number;
  title: string;
  period: string;
  status: '공개중' | '비공개' | string;
  thumbnail: string;
  selected: boolean; // 선택 여부 필드 추가
};

// Sortable Row
function VisualRow({
  row,
  index,
  toggleRow
}: {
  row: Row;
  index: number;
  toggleRow: (id: number, checked: boolean) => void;
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
      className="flex items-center border-b border-pace-gray-100 text-pace-base text-pace-gray-500 h-[138px] pl-6 gap-x-6"
    >
      {/* 체크박스 */}
      <div className="w-8">
        <Checkbox
          checked={row.selected}
          onCheckedChange={(checked) => toggleRow(row.id, !!checked)}
          className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
        />
      </div>

      {/* 순서 */}
      <div className="w-8 text-pace-stone-500 text-pace-sm">{index + 1}</div>

      {/* 썸네일 */}
      <div className="w-40">
        <Image
          src={row.thumbnail}
          alt={row.title}
          width={159}
          height={106}
          className="rounded object-cover"
        />
      </div>

      {/* 제목 + 기간 */}
      <div className="col-span-2 flex-1">
        <p className="font-medium text-pace-base pb-2">{row.title}</p>
        <p className="text-pace-sm text-pace-stone-500">
          게시 기간: {row.period}
        </p>
      </div>

      {/* 공개 여부 */}
      <div className="w-32">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[124px] h-[48px] px-3 border border-gray-300 rounded !text-pace-base">
            <span
              className={
                value === 'public'
                  ? 'text-pace-gray-700 font-bold'
                  : 'text-pace-stone-500 font-normal'
              }
            >
              {value === 'public' ? '공개중' : '비공개'}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md !text-pace-base">
            <SelectItem
              value="public"
              className="!text-pace-base text-pace-gray-700 font-bold"
            >
              공개중
            </SelectItem>
            <SelectItem
              value="private"
              className="!text-pace-base text-pace-stone-500 font-normal"
            >
              비공개
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 액션 */}
      <div className="flex items-center gap-6">
        {/* 버튼들 */}
        <div className="flex gap-2">
          {/* TODO: DB 완료 후 수정 ID 추가 */}
          <Link href="/admin/main-visual/1">
            <button className="w-[76px] h-[44px] bg-pace-stone-500 !text-pace-base text-pace-white-500 rounded-[4px] flex items-center justify-center">
              수정
            </button>
          </Link>
          {/* TODO: DB 완료 후 삭제 기능 추가 */}
          <button className="w-[76px] h-[44px] bg-pace-white-500 !text-pace-base text-pace-stone-500 border border-pace-stone-500 rounded-[4px] flex items-center justify-center">
            삭제
          </button>
        </div>

        {/* 드래그 핸들 */}
        <span {...listeners} className="cursor-move flex items-center">
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

export default function Page() {
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      period: '2025.11.01~2025.11.30',
      status: '공개중',
      thumbnail: '/img/ebook_image1.png',
      selected: false
    },
    {
      id: 2,
      title: '면접 꿀팁 총정리',
      period: '2025.12.01~2025.12.15',
      status: '비공개',
      thumbnail: '/img/ebook_image1.png',
      selected: false
    },
    {
      id: 3,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      period: '2025.11.01~2025.11.30',
      status: '공개중',
      thumbnail: '/img/ebook_image1.png',
      selected: false
    },
    {
      id: 4,
      title: '면접 꿀팁 총정리',
      period: '2025.12.01~2025.12.15',
      status: '비공개',
      thumbnail: '/img/ebook_image1.png',
      selected: false
    },
    {
      id: 5,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      period: '2025.11.01~2025.11.30',
      status: '공개중',
      thumbnail: '/img/ebook_image1.png',
      selected: false
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // 개별 Row 선택 토글
  const toggleRow = (id: number, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, selected: checked } : row))
    );
  };

  // 전체 선택 토글
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

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">메인 비주얼 관리</h1>
        {/* TODO: DB 완료 후 저장 기능 추가 */}
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>

      <div>
        {/* 메인 비주얼 리스트 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            메인 비주얼 리스트
          </span>
        </div>

        {/* 전체 선택 */}
        <div className="pt-6 pb-6 flex items-center">
          <Checkbox
            checked={rows.every((row) => row.selected)}
            onCheckedChange={(checked) => toggleAll(!!checked)}
            className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
          />
          <span className="ml-2 text-pace-sm text-pace-gray-700">전체선택</span>
        </div>

        <div className="w-full pb-6">
          {/* 헤더 */}
          <div className="flex items-center border-b border-t border-pace-gray-100 text-pace-base text-pace-gray-500 h-[56px] pl-6 gap-x-6 text-center">
            <div className="w-8">선택</div>
            <div className="w-8">순서</div>
            <div className="w-40">썸네일</div>
            <div className="flex-1">제목</div>
            <div className="w-32">공개여부</div>
            <div className="w-48"></div>
          </div>

          {/* 드래그 가능한 데이터 Rows */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {rows.map((row, index) => (
                <VisualRow
                  key={row.id}
                  row={row}
                  index={index}
                  toggleRow={toggleRow}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex items-center gap-2 justify-end pb-6">
          {/* TODO: DB 완료 후 삭제 기능 추가 */}
          <button className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center">
            삭제
          </button>

          <Link href="/admin/main-visual/new">
            <button className="w-[112px] h-[60px] bg-pace-gray-700 !text-pace-lg text-pace-white-500 rounded-[4px] flex items-center justify-center">
              추가
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
