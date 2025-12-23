'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import PaceSelect from '@/components/ui/admin/select';

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
  title: string; // 강의제목
  description: string; // 강의내용
  price: string; // 금액
  likes: number; // 찜
  purchases: number; // 구매
  status: '공개중' | '비공개' | string;
  thumbnail: string;
  selected: boolean; // 선택 여부 필드 추가
  category: string; // 카테고리 필드 추가
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
      className="flex items-center border-b border-pace-gray-100 text-pace-base text-pace-gray-500 h-[138px] pl-7 gap-x-7"
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
      <div className="w-8 text-pace-stone-500 text-pace-sm text-center">
        {index + 1}
      </div>

      {/* 카테고리 */}
      <div className="w-32 text-pace-stone-500 text-pace-sm text-center">
        {row.category}
      </div>

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

      {/* 강의제목 + 세부 정보 */}
      <div className="flex-1">
        {/* 강의제목 */}
        <p className="font-medium text-pace-base pb-2">{row.title}</p>

        {/* 강의내용 */}
        <p className="text-pace-sm text-pace-stone-500 pb-1">
          {row.description}
        </p>

        {/* 금액 / 찜 / 구매 */}
        <div className="flex items-center gap-4 text-pace-sm text-pace-gray-700">
          <span>
            금액 <span className="font-semibold">{row.price}</span>
          </span>
          <span>
            찜 <span className="font-semibold">{row.likes}</span>
          </span>
          <span>
            구매 <span className="font-semibold">{row.purchases}</span>
          </span>
        </div>
      </div>

      {/* 공개 여부 */}
      <div className="w-32">
        <PaceSelect
          value={value}
          onChange={setValue}
          width="w-[124px]"
          options={[
            { value: 'public', label: '공개중' },
            { value: 'private', label: '비공개' }
          ]}
          valueClassMap={{
            public: 'text-pace-gray-700 font-bold',
            private: 'text-pace-stone-500 font-normal',
            '': 'text-pace-stone-500 font-normal'
          }}
        />
      </div>

      {/* 액션 */}
      <div className="flex items-center gap-6">
        {/* 버튼들 */}
        <div className="flex gap-2">
          {/* TODO: DB 완료 후 수정 ID 추가 */}
          <Link href="/admin/courses/1">
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
  const [categoryFilter, setCategoryFilter] = useState('TOTAL');

  // 한글 매핑 함수 (CourseHeader와 동일 스타일)
  const getKoreanCategory = (categoryName: string) => {
    switch (categoryName) {
      case 'TOTAL':
        return '전체 카테고리';
      case 'INTERVIEW':
        return '인터뷰';
      case 'RESUME':
        return '이력서';
      case 'NETWORKING':
        return '네트워킹';
      default:
        return categoryName;
    }
  };

  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '네트워킹'
    },
    {
      id: 2,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '인터뷰'
    },
    {
      id: 3,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '이력서'
    },
    {
      id: 4,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '네트워킹'
    },
    {
      id: 5,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '인터뷰'
    },
    {
      id: 6,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '네트워킹'
    },
    {
      id: 7,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '네트워킹'
    },
    {
      id: 8,
      title: '자기소개서 작성 및 면접 준비까지 하나로!',
      description:
        '강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.강의 내용입니다.',
      price: '$999',
      likes: 999,
      purchases: 123,
      status: '공개중',
      thumbnail: '/img/course_image1.png',
      selected: false,
      category: '네트워킹'
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

  // 카테고리별로 필터링된 rows
  const filteredRows = rows.filter((row) => {
    if (categoryFilter === 'TOTAL') return true; // 전체 보기
    return getKoreanCategory(categoryFilter) === row.category;
  });

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">온라인 강의 관리</h1>
        {/* TODO: DB 완료 후 저장 기능 추가 */}
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>
      <div>
        {/* 온라인 강의 리스트 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            온라인 강의 리스트
          </span>
        </div>

        {/* 전체 선택 & 전체 카테고리 */}
        <div className="pt-6 pb-6 flex items-center justify-between">
          {/* 왼쪽: 전체선택 */}
          <div className="flex items-center">
            <Checkbox
              checked={rows.every((row) => row.selected)}
              onCheckedChange={(checked) => toggleAll(!!checked)}
              className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
            />
            <span className="ml-2 text-pace-sm text-pace-gray-700">
              전체선택
            </span>
          </div>

          {/* 오른쪽: 카테고리 필터 (CourseHeader 스타일) */}
          <PaceSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            width="w-[145px]"
            options={[
              { value: 'TOTAL', label: '전체 카테고리' },
              { value: 'INTERVIEW', label: '인터뷰' },
              { value: 'RESUME', label: '이력서' },
              { value: 'NETWORKING', label: '네트워킹' }
            ]}
          />
        </div>

        <div className="w-full pb-7">
          {/* 헤더 */}
          <div className="flex items-center border-b border-t border-pace-gray-100 text-pace-base text-pace-gray-500 h-[56px] pl-7 gap-x-7 text-center">
            <div className="w-8">선택</div>
            <div className="w-8">순서</div>
            <div className="w-32">카테고리</div>
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
              {filteredRows.map((row, index) => (
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

        {/* 삭제, 추가 버튼들 */}
        <div className="flex items-center gap-2 justify-end pb-6">
          {/* TODO: DB 완료 후 삭제 기능 추가 */}
          <button className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center">
            삭제
          </button>

          <Link href="/admin/courses/new">
            <button className="w-[112px] h-[60px] bg-pace-gray-700 !text-pace-lg text-pace-white-500 rounded-[4px] flex items-center justify-center">
              추가
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
