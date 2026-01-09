'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ItemType } from '@prisma/client';
import { UserRow, UserRole } from '@/types/admin/user';
import { Checkbox } from '@/components/ui/checkbox';
import PaceSelect from '@/components/ui/admin/select';
import { getUsers, getUserOrders, OrderDetail } from './actions';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

function UserTableRow({
  user,
  index,
  toggleRow,
  onRoleChange,
  onPurchaseClick
}: {
  user: UserRow;
  index: number;
  toggleRow: (id: string, checked: boolean) => void;
  onRoleChange: (id: string, role: string) => void;
  onPurchaseClick: (userId: string, userName: string) => void;
}) {
  return (
    <div className="flex items-center border-b border-pace-gray-100 text-pace-base text-pace-gray-500 h-[120px] pl-6 gap-x-6">
      {/* 체크박스 */}
      <div className="w-8">
        <Checkbox
          checked={user.selected}
          onCheckedChange={(checked) => toggleRow(user.id, !!checked)}
          className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
        />
      </div>

      {/* 순서 */}
      <div className="w-8 text-pace-stone-500 text-pace-sm text-center">
        {index + 1}
      </div>

      {/* 회원 정보 */}
      <div className="flex-1 flex items-center gap-4">
        <Image
          src={user.image}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-pace-base pb-1">{user.name}</p>
          <p className="text-pace-base text-pace-stone-500">
            {user.email}
            <span className="text-pace-sm text-pace-stone-700 ml-4">
              {user.createdAt} 가입
            </span>
          </p>
          {user.role !== UserRole.ADMIN && user.purchases && (
            <p className="text-pace-sm text-pace-stone-500 pt-2">
              강의
              <span className="font-bold pl-2 pr-4">
                {user.purchases.lectures}회
              </span>
              전자책
              <span className="font-bold pl-2 pr-4">
                {user.purchases.ebooks}회
              </span>
              워크샵
              <span className="font-bold pl-2 pr-4">
                {user.purchases.workshops}회
              </span>
            </p>
          )}
        </div>
      </div>

      {/* 회원 등급 */}
      <div>
        <PaceSelect
          value={user.role}
          onChange={(value) => onRoleChange(user.id, value)}
          width="w-[124px]"
          options={[
            { value: UserRole.ADMIN, label: '관리자' },
            { value: UserRole.INSTRUCTOR, label: '강사' },
            { value: UserRole.USER, label: '정회원' }
          ]}
          valueClassMap={{
            public: 'text-pace-gray-700 font-bold',
            private: 'text-pace-stone-500 font-normal',
            '': 'text-pace-stone-500 font-normal'
          }}
        />
      </div>

      <div>
        <button
          onClick={() => onPurchaseClick(user.id, user.name)}
          className="w-[104px] h-11 bg-pace-white-500 !text-pace-base text-pace-stone-500 border border-pace-stone-500 rounded-[4px] flex items-center justify-center hover:bg-pace-gray-100"
        >
          구매내역
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [open, setOpen] = useState(false);

  const [selectedUserOrders, setSelectedUserOrders] = useState<OrderDetail[]>(
    []
  );
  const [selectedUserName, setSelectedUserName] = useState('');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { users: data, total } = await getUsers(
          currentPage,
          ITEMS_PER_PAGE,
          roleFilter
        );
        setUsers(data);
        setTotalUsers(total);
      } catch (error) {
        toast(`Failed to fetch users: ${error}`);
      }
    };
    fetchUsers();
  }, [currentPage, roleFilter]);

  // 개별 Row 선택 토글
  const toggleRow = (id: string, checked: boolean) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, selected: checked } : user
      )
    );
  };

  // 전체 선택 토글
  const toggleAll = (checked: boolean) => {
    setUsers((prev) => prev.map((user) => ({ ...user, selected: checked })));
  };

  // 역할 변경 핸들러
  const handleRoleChange = (id: string, role: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, role: role as UserRole } : user
      )
    );
  };

  // 역할 필터 변경 핸들러 (페이지 리셋)
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value as typeof roleFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // 구매내역 클릭 핸들러
  const handlePurchaseClick = async (userId: string, userName: string) => {
    try {
      const orders = await getUserOrders(userId);
      setSelectedUserOrders(orders);
      setSelectedUserName(userName);
      setOpen(true);
    } catch (error) {
      toast.error(`Failed to fetch orders: ${error}`);
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold text-pace-gray-700">
          회원 관리
        </h1>
        {/* TODO: DB 완료 후 저장 기능 추가 */}
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>

      <div>
        {/* 회원 리스트 */}
        <div className="border-b pb-4 border-pace-gray-700">
          <span className="text-pace-gray-700 text-pace-xl font-bold leading-[52px]">
            회원 리스트
          </span>
        </div>

        {/* 전체 선택 */}
        <div className="pt-6 pb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              checked={users.every((user) => user.selected)}
              onCheckedChange={(checked) => toggleAll(!!checked)}
              className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
            />
            <span className="ml-2 text-pace-sm text-pace-gray-700">
              전체선택
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PaceSelect
              value={roleFilter}
              onChange={handleRoleFilterChange}
              width="w-[124px]"
              options={[
                { value: 'all', label: '전체 회원' },
                { value: UserRole.ADMIN, label: '관리자' },
                { value: UserRole.INSTRUCTOR, label: '강사' },
                { value: UserRole.USER, label: '정회원' }
              ]}
              valueClassMap={{
                public: 'text-pace-gray-700 font-bold',
                private: 'text-pace-stone-500 font-normal',
                '': 'text-pace-stone-500 font-normal'
              }}
            />
          </div>
        </div>

        <div className="w-full pb-6">
          {/* 헤더 */}
          <div className="flex items-center border-b border-t border-pace-gray-100 text-pace-base text-pace-gray-500 h-[56px] pl-6 gap-x-6 text-center">
            <div className="w-8">선택</div>
            <div className="w-8">순서</div>
            <div className="flex-1 text-center">회원 정보</div>
            <div className="w-32">회원 등급</div>
            <div className="w-[104px]"></div>
          </div>

          {/* 데이터 Rows */}
          {users.map((user, index) => (
            <UserTableRow
              key={user.id}
              user={user}
              index={(currentPage - 1) * ITEMS_PER_PAGE + index}
              toggleRow={toggleRow}
              onRoleChange={handleRoleChange}
              onPurchaseClick={handlePurchaseClick}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-end pb-10">
          {/* Pagination */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-2 h-2 flex items-center justify-center rounded hover:bg-pace-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/icons/chevron-left.svg"
                alt="Previous"
                width={16}
                height={16}
              />
            </button>
            {Array.from(
              { length: Math.ceil(totalUsers / ITEMS_PER_PAGE) },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded text-pace-base ${
                  currentPage === page
                    ? 'text-pace-orange-800 font-bold'
                    : 'hover:bg-pace-gray-100 text-pace-stone-500'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(totalUsers / ITEMS_PER_PAGE))
                )
              }
              disabled={currentPage === Math.ceil(totalUsers / ITEMS_PER_PAGE)}
              className="w-2 h-2 flex items-center justify-center rounded hover:bg-pace-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/icons/chevron-right.svg"
                alt="Next"
                width={16}
                height={16}
              />
            </button>
          </div>

          {/* Delete Button */}
          {/* TODO: DB 완료 후 삭제 기능 추가 */}
          <button className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center">
            삭제
          </button>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[760px] p-10 gap-10 text-pace-black-500"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="justify-between items-center">
            <DialogTitle className="text-[28px] font-bold">
              회원 구매내역
            </DialogTitle>
          </DialogHeader>

          <div>
            {selectedUserOrders.length === 0 ? (
              <p className="text-center text-pace-gray-500 py-8">
                구매 내역이 없습니다.
              </p>
            ) : (
              <div>
                {/* User Info */}
                <div className="pb-4 border-b border-pace-gray-700">
                  <div className="flex gap-4">
                    <span className="text-pace-base font-medium text-pace-gray-700">
                      {selectedUserName}
                    </span>
                    <span className="text-pace-base text-pace-stone-500">
                      {users.find((u) => u.name === selectedUserName)?.email ||
                        ''}
                    </span>
                  </div>
                </div>

                {/* Orders */}
                <div className="">
                  {selectedUserOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between space-y-4 py-4 border-b border-pace-gray-200"
                    >
                      {/* Order Items */}
                      <div>
                        <div className="flex gap-4 text-pace-sm pb-2">
                          <span className="text-pace-stone-500">
                            날짜: {order.orderedAt}
                          </span>
                          <span className="text-pace-stone-500">
                            주문번호: {order.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-4 text-pace-base"
                            >
                              <span className="w-20 text-pace-gray-700">
                                {item.itemType === ItemType.COURSE
                                  ? '온라인 강의'
                                  : item.itemType === ItemType.VIDEO
                                    ? '온라인 강의'
                                    : item.itemType === ItemType.EBOOK
                                      ? '전자책'
                                      : item.itemType === ItemType.DOCUMENT
                                        ? '전자책'
                                        : item.itemType === ItemType.WORKSHOP
                                          ? '워크샵'
                                          : item.itemType}
                              </span>
                              <span className="text-pace-gray-700">
                                {item.itemTitle}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 items-center justify-center">
                        <p className="text-pace-base font-semibold text-pace-gray-700">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-pace-base font-medium">
                          {order.status === 'COMPLETED'
                            ? '결제 완료'
                            : order.status === 'PENDING'
                              ? '대기중'
                              : order.status === 'CANCELLED'
                                ? '취소됨'
                                : order.status === 'FAILED'
                                  ? '실패'
                                  : order.status === 'REFUNDED'
                                    ? '환불됨'
                                    : order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
