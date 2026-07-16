'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import PaceSelect from '@/components/ui/admin/select';
import { getWorkshops, updateWorkshopStatuses, WorkshopRow } from './actions';
import AdminListLayout from '@/components/admin/common/admin-list-layout';
import AdminVisualRow, {
  RowLike
} from '@/components/admin/common/admin-visual-row';
import { generateKeyBetween } from 'fractional-indexing';
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

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
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

  const fetchWorkshops = useCallback(async () => {
    try {
      const data = await getWorkshops();
      setRows(data);
      setBlocked(false); // 초기화 시 변경상태 해제
    } catch (error) {
      toast.error(`Failed to fetch workshops: ${error}`);
    }
  }, [setBlocked]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // 개별 Row 선택 토글
  const mapSelectToDbStatus = (selectValue: string) => {
    switch (selectValue) {
      case 'open':
        return 'OPEN';
      case 'closed':
        return 'CLOSED';
      case 'completed':
        return 'COMPLETED';
      case 'hidden':
        return 'HIDDEN';
      default:
        return 'OPEN';
    }
  };

  const toggleRow = (id: string, checked: boolean, newStatus?: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              selected: checked,
              ...(newStatus
                ? { status: mapSelectToDbStatus(newStatus) as Row['status'] }
                : {})
            }
          : row
      )
    );
  };

  // 전체 선택 토글
  const toggleAll = (checked: boolean) => {
    setRows((prev) => prev.map((row) => ({ ...row, selected: checked })));
  };

  // 상태 변경 핸들러
  const handleStatusChange = (id: string, status: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: mapSelectToDbStatus(status) as Row['status'] }
          : row
      )
    );
    setBlocked(true);
  };

  // Status UI used by AdminVisualRow
  const WorkshopStatus = ({
    row,
    onStatusChange: _onStatusChange
  }: {
    row: RowLike;
    toggleRow: (id: string, checked: boolean, newStatus?: string) => void;
    onStatusChange?: (id: string, newStatus: string) => void;
  }) => {
    const getSelectValue = (status?: string) => {
      switch (status) {
        case 'OPEN':
          return 'open';
        case 'CLOSED':
          return 'closed';
        case 'COMPLETED':
          return 'completed';
        case 'HIDDEN':
          return 'hidden';
        default:
          return 'open';
      }
    };

    const [value, setValue] = useState(getSelectValue(row.status));

    useEffect(() => {
      setValue(getSelectValue(row.status));
    }, [row.status]);

    return (
      <PaceSelect
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          _onStatusChange?.(row.id, newValue);
        }}
        width="w-[124px]"
        options={[
          { value: 'open', label: '모집중' },
          { value: 'closed', label: '모집완료' },
          { value: 'completed', label: '진행완료' },
          { value: 'hidden', label: '비공개' }
        ]}
        valueClassMap={{
          open: 'text-pace-gray-700 font-semibold',
          closed: 'text-pace-gray-700 font-semibold',
          completed: 'text-pace-gray-700 font-semibold',
          hidden: 'text-pace-gray-700 font-semibold',
          '': 'text-pace-stone-500 font-semibold'
        }}
      />
    );
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
  };

  const handleSave = async () => {
    try {
      const statusUpdates = rows.map((r) => ({ id: r.id, status: r.status }));
      const orderUpdates = rows.map((r) => ({
        id: r.id,
        orderKey: r.orderKey
      }));

      await Promise.all([
        updateWorkshopStatuses(statusUpdates),
        fetch('/api/workshops/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: orderUpdates })
        })
      ]);

      toast.success('저장되었습니다.');
      const data = await getWorkshops();
      setRows(data);
    } catch {
      toast.error('저장에 실패했습니다.');
    }
  };

  const handleDeleteClick = (id?: string) => {
    const targetIds = id
      ? [id]
      : rows.filter((r) => r.selected).map((r) => r.id);

    if (targetIds.length === 0) {
      toast.info('삭제할 항목을 선택해주세요.');
      return;
    }

    setDeleteTargetId(id);
    setDeleteMessage(
      id
        ? '선택한 워크샵을 정말 삭제하시겠습니까?'
        : `선택한 ${targetIds.length}개의 워크샵을 정말 삭제하시겠습니까?`
    );
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    const targetIds = deleteTargetId
      ? [deleteTargetId]
      : rows.filter((r) => r.selected).map((r) => r.id);

    try {
      const res = await fetch('/api/workshops', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetIds })
      });

      if (res.ok) {
        toast.success(
          `${targetIds.length}개의 워크샵이 성공적으로 삭제되었습니다.`
        );
        const data = await getWorkshops();
        setRows(data);
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

  // 상태별로 필터링된 rows
  const filteredRows = rows.filter((row) => {
    if (statusFilter === 'ALL') return true;
    return row.status === statusFilter;
  });

  return (
    <>
      <AdminListLayout
        title="워크샵 관리"
        onSave={handleSave}
        listTitle={
          <div className="border-b border-pace-gray-700 pb-5">
            <span className="text-pace-xl font-bold leading-[52px]">
              워크샵 리스트
            </span>
          </div>
        }
        leftControls={
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
        }
        rightControls={
          <PaceSelect
            value={statusFilter}
            onChange={setStatusFilter}
            width="w-[145px]"
            options={[
              { value: 'ALL', label: '전체 상태' },
              { value: 'OPEN', label: '모집중' },
              { value: 'CLOSED', label: '모집완료' },
              { value: 'COMPLETED', label: '진행완료' },
              { value: 'HIDDEN', label: '비공개' }
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
            <div className="w-32">상태</div>
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
              href="/admin/workshops/new"
              onClick={(e) => {
                e.preventDefault();
                attemptNavigation('/admin/workshops/new');
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
              items={filteredRows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredRows.map((row) => {
                const index = rows.findIndex((r) => r.id === row.id);

                return (
                  <AdminVisualRow
                    key={row.id}
                    row={row}
                    index={index}
                    toggleRow={toggleRow}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteClick}
                    StatusComponent={WorkshopStatus}
                    editHref={`/admin/workshops/${row.id}`}
                    attemptNavigation={attemptNavigation}
                    categoryLabel={(cat?: string) => getCategoryLabel(cat)}
                    resolveThumbnail={(r: RowLike) =>
                      r.thumbnail || '/img/workshop_image3.png'
                    }
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </AdminListLayout>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="워크샵 삭제"
        description={deleteMessage}
        onConfirm={executeDelete}
        confirmText="삭제"
        cancelText="취소"
      />
    </>
  );
}
