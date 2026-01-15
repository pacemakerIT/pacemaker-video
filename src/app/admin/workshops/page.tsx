'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import PaceSelect from '@/components/ui/admin/select';
import { getWorkshops, WorkshopRow } from './actions';
import { toast } from 'sonner';

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

type Row = WorkshopRow;

const getCategoryLabel = (category: string | null | undefined): string => {
  if (!category) return '네트워킹';

  switch (category) {
    case 'INTERVIEW':
      return '면접';
    case 'RESUME':
      return '이력서';
    case 'NETWORKING':
      return '네트워킹';
    default:
      return '네트워킹';
  }
};

// Sortable Row
function VisualRow({
  row,
  index,
  toggleRow,
  onStatusChange
}: {
  row: Row;
  index: number;
  toggleRow: (id: string, checked: boolean) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  // Map database status to select value
  const getSelectValue = (status: string) => {
    switch (status) {
      case 'RECRUITING':
        return 'recruiting';
      case 'CLOSED':
        return 'closed';
      case 'ONGOING':
        return 'ongoing';
      case 'COMPLETED':
        return 'completed';
      case 'HIDDEN':
        return 'hidden';
      default:
        return 'recruiting';
    }
  };

  const [value, setValue] = useState(getSelectValue(row.status));

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
        {getCategoryLabel(row.category)}
      </div>

      {/* 썸네일 */}
      <div className="w-40">
        <Image
          src={row.thumbnail || '/img/workshop_image3.png'}
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
            금액 <span className="font-semibold">${row.price.toFixed(2)}</span>
          </span>
          <span>
            찜 <span className="font-semibold">{row.likes}</span>
          </span>
          <span>
            구매 <span className="font-semibold">{row.purchases}</span>
          </span>
        </div>
      </div>

      {/* 워크샵 상태 */}
      <div className="w-32">
        <PaceSelect
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            onStatusChange(row.id, newValue);
          }}
          width="w-[124px]"
          options={[
            { value: 'recruiting', label: '모집중' },
            { value: 'closed', label: '모집완료' },
            { value: 'completed', label: '진행완료' },
            { value: 'hidden', label: '비공개' }
          ]}
          valueClassMap={{
            recruiting: 'text-pace-gray-700 font-semibold',
            closed: 'text-pace-gray-700 font-semibold',
            ongoing: 'text-pace-gray-700 font-semibold',
            completed: 'text-pace-gray-700 font-semibold',
            hidden: 'text-pace-gray-700 font-semibold',
            '': 'text-pace-stone-500 font-semibold'
          }}
        />
      </div>

      {/* 액션 */}
      <div className="flex items-center gap-6">
        {/* 버튼들 */}
        <div className="flex gap-2">
          <Link href={`/admin/workshops/${row.id}`}>
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
  const [rows, setRows] = useState<Row[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await getWorkshops();
        setRows(data);
      } catch (error) {
        toast.error(`Failed to fetch workshops: ${error}`);
      }
    };
    fetchWorkshops();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // 개별 Row 선택 토글
  const toggleRow = (id: string, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, selected: checked } : row))
    );
  };

  // 전체 선택 토글
  const toggleAll = (checked: boolean) => {
    setRows((prev) => prev.map((row) => ({ ...row, selected: checked })));
  };

  // 상태 변경 핸들러
  const handleStatusChange = (id: string, status: string) => {
    // Map select value back to database status
    const getDbStatus = (selectValue: string) => {
      switch (selectValue) {
        case 'recruiting':
          return 'RECRUITING';
        case 'closed':
          return 'CLOSED';
        case 'ongoing':
          return 'ONGOING';
        case 'completed':
          return 'COMPLETED';
        case 'hidden':
          return 'HIDDEN';
        default:
          return 'RECRUITING';
      }
    };

    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: getDbStatus(status) as Row['status'] }
          : row
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((row) => row.id === active.id);
      const newIndex = rows.findIndex((row) => row.id === over.id);
      setRows((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  // 상태별로 필터링된 rows
  const filteredRows = rows.filter((row) => {
    if (statusFilter === 'ALL') return true;
    return row.status === statusFilter;
  });

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">워크샵 관리</h1>
        {/* TODO: DB 완료 후 저장 기능 추가 */}
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>
      <div>
        {/* 워크샵 리스트 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            워크샵 리스트
          </span>
        </div>

        {/* 전체 선택 & 상태 필터 */}
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

          {/* 오른쪽: 상태 필터 */}
          <PaceSelect
            value={statusFilter}
            onChange={setStatusFilter}
            width="w-[145px]"
            options={[
              { value: 'ALL', label: '전체 상태' },
              { value: 'RECRUITING', label: '모집중' },
              { value: 'CLOSED', label: '모집완료' },
              { value: 'COMPLETED', label: '진행완료' },
              { value: 'HIDDEN', label: '비공개' }
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
            <div className="w-32">상태</div>
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
                  onStatusChange={handleStatusChange}
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

          <Link href="/admin/workshops/new">
            <button className="w-[112px] h-[60px] bg-pace-gray-700 !text-pace-lg text-pace-white-500 rounded-[4px] flex items-center justify-center">
              추가
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
