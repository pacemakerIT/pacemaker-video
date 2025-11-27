'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

type UserRow = {
  id: number;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  role: 'admin' | 'user' | 'instructor';
  selected: boolean;
  purchases?: {
    lectures: number;
    ebooks: number;
    workshops: number;
  };
};

function UserTableRow({
  user,
  index,
  toggleRow,
  onRoleChange
}: {
  user: UserRow;
  index: number;
  toggleRow: (id: number, checked: boolean) => void;
  onRoleChange: (id: number, role: string) => void;
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
          {user.role !== 'admin' && user.purchases && (
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
        <Select
          value={user.role}
          onValueChange={(value) => onRoleChange(user.id, value)}
        >
          <SelectTrigger className="w-[124px] h-12 px-3 border border-gray-300 rounded !text-pace-base">
            <span className="text-pace-gray-700">
              {user.role === 'admin'
                ? '관리자'
                : user.role === 'instructor'
                  ? '강사'
                  : '정회원'}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-white border border-pace-gray-200 shadow-md rounded-md !text-pace-base">
            <SelectItem
              value="admin"
              className="!text-pace-base text-pace-gray-700"
            >
              관리자
            </SelectItem>
            <SelectItem
              value="instructor"
              className="!text-pace-base text-pace-gray-700"
            >
              강사
            </SelectItem>
            <SelectItem
              value="user"
              className="!text-pace-base text-pace-gray-700"
            >
              일반 사용자
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <button className="w-[104px] h-11 bg-pace-white-500 !text-pace-base text-pace-stone-500 border border-pace-stone-500 rounded-[4px] flex items-center justify-center">
          구매내역
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [users, setUsers] = useState<UserRow[]>([
    {
      id: 1,
      name: '김철수',
      email: 'chulsoo.kim@example.com',
      image: '/img/default-profile.png',
      createdAt: '2025.01.15',
      role: 'admin',
      selected: false
    },
    {
      id: 2,
      name: '이영희',
      email: 'younghee.lee@example.com',
      image: '/img/default-profile.png',
      createdAt: '2025.02.20',
      role: 'instructor',
      selected: false,
      purchases: {
        lectures: 12,
        ebooks: 5,
        workshops: 3
      }
    },
    {
      id: 3,
      name: '박민수',
      email: 'minsoo.park@example.com',
      image: '/img/default-profile.png',
      createdAt: '2025.03.10',
      role: 'user',
      selected: false,
      purchases: {
        lectures: 8,
        ebooks: 3,
        workshops: 1
      }
    },
    {
      id: 4,
      name: '정수진',
      email: 'soojin.jung@example.com',
      image: '/img/default-profile.png',
      createdAt: '2025.04.05',
      role: 'user',
      selected: false,
      purchases: {
        lectures: 15,
        ebooks: 7,
        workshops: 4
      }
    },
    {
      id: 5,
      name: '최동욱',
      email: 'dongwook.choi@example.com',
      image: '/img/default-profile.png',
      createdAt: '2025.05.12',
      role: 'instructor',
      selected: false,
      purchases: {
        lectures: 20,
        ebooks: 10,
        workshops: 6
      }
    }
  ]);

  const [roleFilter, setRoleFilter] = useState<
    'all' | 'admin' | 'user' | 'instructor'
  >('all');

  // 개별 Row 선택 토글
  const toggleRow = (id: number, checked: boolean) => {
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
  const handleRoleChange = (id: number, role: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, role: role as UserRow['role'] } : user
      )
    );
  };

  // 역할 필터링
  const filteredUsers =
    roleFilter === 'all'
      ? users
      : users.filter((user) => user.role === roleFilter);

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
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as typeof roleFilter)
              }
            >
              <SelectTrigger className="w-[118px] h-12 p-3 border border-gray-300 rounded !text-pace-sm">
                <span className="text-pace-gray-700 font-semibold text-pace-base">
                  {roleFilter === 'all'
                    ? '전체 회원'
                    : roleFilter === 'admin'
                      ? '관리자'
                      : roleFilter === 'instructor'
                        ? '강사'
                        : '정회원'}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white border border-pace-gray-200 shadow-md rounded-md !text-pace-sm">
                <SelectItem
                  value="all"
                  className="!text-pace-sm text-pace-gray-700"
                >
                  전체
                </SelectItem>
                <SelectItem
                  value="admin"
                  className="!text-pace-sm text-pace-gray-700"
                >
                  관리자
                </SelectItem>
                <SelectItem
                  value="instructor"
                  className="!text-pace-sm text-pace-gray-700"
                >
                  강사
                </SelectItem>
                <SelectItem
                  value="user"
                  className="!text-pace-sm text-pace-gray-700"
                >
                  일반 사용자
                </SelectItem>
              </SelectContent>
            </Select>
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
          {filteredUsers.map((user, index) => (
            <UserTableRow
              key={user.id}
              user={user}
              index={index}
              toggleRow={toggleRow}
              onRoleChange={handleRoleChange}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 justify-end pb-6">
          {/* TODO: DB 완료 후 삭제 기능 추가 */}
          <button className="w-[112px] h-[60px] bg-pace-white-500 !text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded-[4px] flex items-center justify-center">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
