'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminVisualRow, {
  RowLike
} from '@/components/admin/common/admin-visual-row';
import AdminListLayout from '@/components/admin/common/admin-list-layout';
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
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useNavigationBlocker } from '@/components/admin/common/navigation-blocker-context';
import { generateKeyBetween } from 'fractional-indexing';

const CATEGORY_LABELS = itemCategoryLabel.en;

type Row = {
  id: string;
  title: string;
  description: string;
  price: string;
  likes: number;
  purchases: number;
  status: '공개중' | '비공개' | string;
  thumbnail: string;
  selected: boolean;
  category: string;
  orderKey: string;
};

// Status component for courses
function CourseStatus({
  row,
  toggleRow
}: {
  row: RowLike;
  toggleRow: (id: string, checked: boolean, newStatus?: string) => void;
}) {
  const [value, setValue] = useState(
    row.status === '공개중' ? 'public' : 'private'
  );

  useEffect(() => {
    setValue(row.status === '공개중' ? 'public' : 'private');
  }, [row.status]);

  return (
    <PaceSelect
      value={value}
      onChange={(val) => {
        setValue(val);
        toggleRow(row.id, !!row.selected);
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
      const orderUpdates = rows.map((r) => ({
        id: r.id,
        orderKey: r.orderKey
      }));
      const selectedRows = rows.filter((row) => row.selected);

      const promises: Promise<unknown>[] = [
        fetch('/api/courses/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: orderUpdates })
        })
      ];

      if (selectedRows.length > 0) {
        const updates = selectedRows.map((row) => ({
          id: row.id,
          status: row.status
        }));
        promises.push(
          fetch('/api/courses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
          })
        );
      }

      await Promise.all(promises);
      toast.success('저장되었습니다.');
      await fetchCourses();
      setBlocked(false);
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((row) => row.id === active.id);
    const newIndex = rows.findIndex((row) => row.id === over.id);
    const newRows = arrayMove(rows, oldIndex, newIndex);

    const before = newRows[newIndex - 1]?.orderKey ?? null;
    const after = newRows[newIndex + 1]?.orderKey ?? null;
    const newKey = generateKeyBetween(before, after);

    setRows(
      newRows.map((r) => (r.id === active.id ? { ...r, orderKey: newKey } : r))
    );
    setBlocked(true);
  };

  // 카테고리별로 필터링된 rows
  const filteredRows = rows.filter((row) => {
    if (categoryFilter === 'TOTAL') return true; // 전체 보기
    return row.category === categoryFilter;
  });

  if (loading) return <div className="p-10">Loading courses...</div>;

  return (
    <AdminListLayout
      title="온라인 강의 관리"
      onSave={handleSave}
      listTitle={
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            온라인 강의 리스트
          </span>
        </div>
      }
      leftControls={
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
      }
      rightControls={
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
      }
      tableHeader={
        <div className="flex items-center border-b border-t border-pace-gray-100 text-pace-base text-pace-gray-500 h-[56px] pl-7 gap-x-7 text-center">
          <div className="w-8">선택</div>
          <div className="w-8">순서</div>
          <div className="w-32">카테고리</div>
          <div className="w-40">썸네일</div>
          <div className="flex-1">제목</div>
          <div className="w-32">공개여부</div>
          <div className="w-48"></div>
        </div>
      }
      footerRight={
        <>
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
        </>
      }
    >
      <div>
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
              <AdminVisualRow
                key={row.id}
                row={row}
                index={index}
                toggleRow={toggleRow}
                onDelete={handleDeleteClick}
                StatusComponent={CourseStatus}
                editHref={`/admin/courses/${row.id}`}
                attemptNavigation={attemptNavigation}
                categoryLabel={(c?: string) =>
                  CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] || c || ''
                }
                resolveThumbnail={(r: RowLike) => r.thumbnail ?? ''}
              />
            ))}
          </SortableContext>
        </DndContext>
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
    </AdminListLayout>
  );
}
