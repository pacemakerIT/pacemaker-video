'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import PaceSelect from '@/components/ui/admin/select';
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

type MainVisual = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  startDate: string | null;
  endDate: string | null;
  thumbnail: string | null;
  link: string | null;
  linkName: string | null;
  orderIndex: number;
  selected?: boolean;
};

// Sortable Row
function VisualRow({
  row,
  index,
  toggleRow,
  onDelete
}: {
  row: MainVisual;
  index: number;
  toggleRow: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [value, setValue] = useState(row.isPublic ? 'public' : 'private');

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

  const period =
    row.startDate && row.endDate
      ? `${new Date(row.startDate).toLocaleDateString()}~${new Date(row.endDate).toLocaleDateString()}`
      : '-';

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
      <div className="w-8 text-pace-stone-500 text-pace-sm text-center">
        {index + 1}
      </div>

      {/* 썸네일 */}
      <div className="w-40 relative h-[106px] w-[159px]">
        {row.thumbnail ? (
          <Image
            src={row.thumbnail}
            alt={row.title || ''}
            fill
            className="rounded object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-center p-2">
            No Thumbnail
          </div>
        )}
      </div>

      {/* 제목 + 기간 */}
      <div className="col-span-2 flex-1">
        <p className="font-medium text-pace-base pb-2">{row.title}</p>
        <p className="text-pace-sm text-pace-stone-500">게시 기간: {period}</p>
      </div>

      {/* 공개 여부 */}
      <div className="w-32">
        <PaceSelect
          value={value}
          onChange={setValue}
          width="w-[124px]"
          placeholder="선택"
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
          <Link href={`/admin/main-visual/${row.id}`}>
            <button className="w-[76px] h-[44px] bg-pace-stone-500 !text-pace-base text-pace-white-500 rounded-[4px] flex items-center justify-center">
              수정
            </button>
          </Link>
          <button
            onClick={() => onDelete(row.id)}
            className="w-[76px] h-[44px] bg-pace-white-500 !text-pace-base text-pace-stone-500 border border-pace-stone-500 rounded-[4px] flex items-center justify-center"
          >
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
  const [rows, setRows] = useState<MainVisual[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchVisuals();
  }, []);

  const fetchVisuals = async () => {
    try {
      const res = await fetch('/api/main-visual');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRows(data.map((item: MainVisual) => ({ ...item, selected: false })));
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((items) => {
        const oldIndex = items.findIndex((row) => row.id === active.id);
        const newIndex = items.findIndex((row) => row.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      const items = rows.map((row, index) => ({
        id: row.id,
        orderIndex: index
      }));

      const res = await fetch('/api/main-visual/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!res.ok) throw new Error('Failed to save order');
      toast.success('순서가 저장되었습니다.');
    } catch (error) {
      toast.error('순서 저장 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/main-visual/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      setRows((prev) => prev.filter((row) => row.id !== id));
      toast.success('삭제되었습니다.');
    } catch (error) {
      toast.error('삭제 실패');
    }
  };

  const handleDeleteSelected = async () => {
    const selectedIds = rows.filter((r) => r.selected).map((r) => r.id);
    if (selectedIds.length === 0) {
      toast.error('선택된 항목이 없습니다.');
      return;
    }

    if (!confirm(`${selectedIds.length}개의 항목을 삭제하시겠습니까?`)) return;

    try {
      // Promise.all to delete parallel
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/main-visual/${id}`, { method: 'DELETE' })
        )
      );
      setRows((prev) => prev.filter((row) => !row.selected));
      toast.success('선택된 항목이 삭제되었습니다.');
    } catch (error) {
      toast.error('일부 항목 삭제 실패');
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">메인 비주얼 관리</h1>
        <button
          onClick={handleSaveOrder}
          className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded"
        >
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
            checked={rows.length > 0 && rows.every((row) => row.selected)}
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
            <div className="w-40 relative">썸네일</div>
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
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex items-center gap-2 justify-end pb-6">
          <button
            onClick={handleDeleteSelected}
            className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center"
          >
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
