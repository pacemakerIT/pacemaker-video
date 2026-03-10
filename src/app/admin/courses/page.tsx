'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import PaceSelect from '@/components/ui/admin/select';
import { itemCategoryLabel } from '@/constants/labels';
import { toast } from 'sonner';
import ConfirmModal from '@/components/common/confirm-modal';

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
import { useNavigationBlocker } from '@/components/admin/common/navigation-blocker-context';

const CATEGORY_LABELS = itemCategoryLabel.en;

type Row = {
  id: string;
  title: string; // 강의제목
  description: string; // 강의내용
  price: string; // 금액
  likes: number; // 찜
  purchases: number; // 구매
  status: '공개중' | '비공개' | string;
  thumbnail: string;
  selected: boolean; // 선택 여부 필드 추가
  category: string; // 카테고리 필드 추가 (Enum 키값)
};

// Sortable Row
function VisualRow({
  row,
  index,
  toggleRow,
  onStatusChange,
  onDelete
}: {
  row: Row;
  index: number;
  toggleRow: (id: string, checked: boolean) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attemptNavigation } = useNavigationBlocker();
  const value = row.status === '공개중' ? 'public' : 'private';

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
        {CATEGORY_LABELS[row.category as keyof typeof CATEGORY_LABELS] ||
          row.category}
      </div>

      {/* 썸네일 */}
      <div className="w-40 relative h-[106px]">
        {row.thumbnail ? (
          <Image
            src={row.thumbnail}
            alt={row.title}
            fill
            className="rounded object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* 강의제목 + 세부 정보 */}
      <div className="flex-1">
        {/* 강의제목 */}
        <p className="font-medium text-pace-base pb-2">{row.title}</p>

        {/* 강의내용 */}
        <p className="text-pace-sm text-pace-stone-500 pb-1 line-clamp-2">
          {row.description.length > 110
            ? `${row.description.slice(0, 110)}...`
            : row.description}
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
          onChange={(val) => {
            onStatusChange(row.id, val === 'public' ? '공개중' : '비공개');
          }}
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
          <Link
            href={`/admin/courses/${row.id}`}
            onClick={(e) => {
              e.preventDefault();
              attemptNavigation(`/admin/courses/${row.id}`);
            }}
          >
            <button className="w-[76px] h-[44px] bg-pace-stone-500 !text-pace-base text-pace-white-500 rounded-[4px] flex items-center justify-center">
              수정
            </button>
          </Link>
          {/* 삭제 버튼 */}
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
  const [categoryFilter, setCategoryFilter] = useState('TOTAL');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | undefined>(
    undefined
  );
  const [deleteMessage, setDeleteMessage] = useState('');

  const { isBlocked, setBlocked, attemptNavigation } = useNavigationBlocker();

  // 브라우저 탭 닫기/새로고침 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBlocked) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isBlocked]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setRows(data);
        setBlocked(false); // 초기화 시 변경상태 해제
      } else {
        toast('Failed to fetch courses');
      }
    } catch (error) {
      toast(`Failed to connect server: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [setBlocked]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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

  const handleStatusChange = (id: string, status: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status } : row))
    );
    setBlocked(true);
  };

  // 삭제 버튼 클릭 시 모달 오픈
  const handleDeleteClick = (id?: string) => {
    const targetIds = id
      ? [id]
      : rows.filter((r) => r.selected).map((r) => r.id);

    if (targetIds.length === 0) {
      toast.info('삭제할 항목을 선택해주세요.');
      return;
    }

    setDeleteTargetId(id); // id가 없으면 undefined (일괄 삭제)
    setDeleteMessage(
      id
        ? '선택한 강의를 정말 삭제하시겠습니까?'
        : `선택한 ${targetIds.length}개의 강의를 정말 삭제하시겠습니까?`
    );
    setDeleteModalOpen(true);
  };

  // 실제 삭제 로직 (모달 확인 시 실행)
  const executeDelete = async () => {
    const targetIds = deleteTargetId
      ? [deleteTargetId]
      : rows.filter((r) => r.selected).map((r) => r.id);

    try {
      const res = await fetch('/api/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetIds })
      });

      if (res.ok) {
        toast.success(
          `${targetIds.length}개의 강의가 성공적으로 삭제되었습니다.`
        );
        await fetchCourses();
      } else {
        const error = await res.json();
        toast.error(`삭제 실패: ${error.error}`);
      }
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteModalOpen(false);
      setDeleteTargetId(undefined);
    }
  };

  const handleSave = async () => {
    try {
      const selectedRows = rows.filter((row) => row.selected);

      if (selectedRows.length === 0) {
        toast.info('저장할 항목을 선택해주세요.');
        return;
      }

      const updates = selectedRows.map((row) => ({
        id: row.id,
        status: row.status
      }));

      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates })
      });

      if (res.ok) {
        toast.success('저장되었습니다.');
        await fetchCourses();
        setBlocked(false); // 저장 완료 시 변경상태 해제
      } else {
        const errorData = await res.json();
        toast.error(`저장 실패: ${errorData.error || 'Unknown error'}`);
      }
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((row) => row.id === active.id);
      const newIndex = rows.findIndex((row) => row.id === over.id);
      setRows((items) => arrayMove(items, oldIndex, newIndex));
      setBlocked(true);
    }
  };

  // 카테고리별로 필터링된 rows
  const filteredRows = rows.filter((row) => {
    if (categoryFilter === 'TOTAL') return true; // 전체 보기
    return row.category === categoryFilter;
  });

  if (loading) return <div className="p-10">강의 목록 불러오는 중...</div>;

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">온라인 강의 관리</h1>
        <button
          onClick={handleSave}
          className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded hover:bg-pace-orange-900 transition-colors"
        >
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
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              const allSelected =
                rows.length > 0 && rows.every((row) => row.selected);
              toggleAll(!allSelected);
            }}
          >
            <Checkbox
              checked={rows.length > 0 && rows.every((row) => row.selected)}
              onCheckedChange={(checked) => toggleAll(!!checked)}
              className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
            />
            <span className="ml-2 text-pace-sm text-pace-gray-700 select-none">
              전체선택
            </span>
          </div>

          {/* 오른쪽: 카테고리 필터 (CourseHeader 스타일) */}
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
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteClick}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* 삭제, 추가 버튼들 */}
        <div className="flex items-center gap-2 justify-end pb-6">
          {/* 삭제 버튼 */}
          <button
            onClick={() => handleDeleteClick()}
            className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center"
          >
            삭제
          </button>

          <Link
            href="/admin/courses/new"
            onClick={(e) => {
              e.preventDefault();
              attemptNavigation('/admin/courses/new');
            }}
          >
            <button className="w-[112px] h-[60px] bg-pace-gray-700 !text-pace-lg text-pace-white-500 rounded-[4px] flex items-center justify-center">
              추가
            </button>
          </Link>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="강의 삭제"
        description={deleteMessage}
        onConfirm={executeDelete}
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  );
}
