'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  getEbooks,
  deleteEbook,
  updateEbookStatuses,
  EbookWithStats
} from '@/lib/actions/ebook-actions';
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

const CATEGORY_MAP: Record<string, string> = {
  TOTAL: '전체 카테고리',
  MARKETING: '마케팅',
  IT: 'IT/개발',
  DESIGN: '디자인',
  PUBLIC: '공공',
  ACCOUNTING: '회계',
  SERVICE: '서비스',
  INTERVIEW: '인터뷰',
  RESUME: '이력서',
  NETWORKING: '네트워킹'
};

// Sortable Row Component
function VisualRow({
  row,
  index,
  toggleRow,
  onDelete
}: {
  row: Row;
  index: number;
  toggleRow: (id: string, checked: boolean, newStatus?: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [value, setValue] = useState(
    row.status === '공개중' ? 'public' : 'private'
  );

  useEffect(() => {
    setValue(row.status === '공개중' ? 'public' : 'private');
  }, [row.status]);

  const handleStatusChange = (newValue: string) => {
    setValue(newValue);
    toggleRow(
      row.id,
      row.selected,
      newValue === 'public' ? '공개중' : '비공개'
    );
  };

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
          onCheckedChange={(checked) => toggleRow(row.id, !!checked, undefined)}
          className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
        />
      </div>

      {/* Order */}
      <div className="w-8 text-pace-stone-500 text-pace-sm text-center">
        {index + 1}
      </div>

      {/* Category */}
      <div className="w-32 text-pace-stone-500 text-pace-sm text-center">
        {row.category}
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
          onChange={handleStatusChange}
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
          <button
            onClick={() => onDelete?.(row.id)}
            className="w-[76px] h-[44px] bg-pace-white-500 !text-pace-base text-pace-stone-500 border border-pace-stone-500 rounded-[4px] flex items-center justify-center hover:bg-gray-50"
          >
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

  // State to track rows
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const documents = await getEbooks();
      const mappedRows: Row[] = documents.map((doc: EbookWithStats) => ({
        id: doc.id,
        category: doc.category || '',
        thumbnail: doc.thumbnail || '/img/ebook-default.png',
        title: doc.title || '제목 없음',
        description: doc.description || '',
        price: doc.price || 0,
        purchaseCount: doc.purchaseCount || 0,
        likes: doc.likes || 0,
        status: doc.isPublic ? '공개중' : '비공개',
        selected: false
      }));
      setRows(mappedRows);
    } catch (error) {
      console.error('Failed to fetch ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    // Identify modified statuses
    const updates = rows.map((r) => ({
      id: r.id,
      isPublic: r.status === '공개중'
    }));

    try {
      await updateEbookStatuses(updates);
      alert('저장되었습니다.');
      fetchData(); // Refresh
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id?: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      if (id) {
        await deleteEbook(id);
      } else {
        // Batch delete
        const selectedIds = rows.filter((r) => r.selected).map((r) => r.id);
        if (selectedIds.length === 0) return;
        await Promise.all(selectedIds.map((sid) => deleteEbook(sid)));
      }
      fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const toggleRow = (id: string, checked: boolean, newStatus?: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            selected: checked,
            status: newStatus !== undefined ? newStatus : row.status
          };
        }
        return row;
      })
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
      row.category === categoryFilter ||
      (categoryFilter !== 'TOTAL' && row.category?.includes(categoryFilter))
    );
  });

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">전자책 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded hover:bg-pace-orange-900 transition-colors"
          >
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
              { value: 'TOTAL', label: '전체 카테고리' },
              { value: 'MARKETING', label: '마케팅' },
              { value: 'IT', label: 'IT/개발' },
              { value: 'DESIGN', label: '디자인' },
              { value: 'PUBLIC', label: '공공' },
              { value: 'ACCOUNTING', label: '회계' },
              { value: 'SERVICE', label: '서비스' }
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
                    onDelete={handleDelete}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 justify-end pb-6">
          <button
            onClick={() => handleDelete()}
            className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
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
