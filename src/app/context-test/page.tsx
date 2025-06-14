'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserContext } from '@/app/context/user-context';
import { toast } from 'sonner';
import { User } from '@/types/user';

export default function UserContextTestPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { user, isLoading, error, setUser } = useUserContext();
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUser(data[0] as User);
        } else if (!Array.isArray(data) && data) {
          setUser(data as User);
        } else {
          toast.error('User data not found in database.');
          setUser(null);
        }
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ error: 'Unknown API error' }));
        const message =
          errorData?.error || `Failed to fetch user: ${res.statusText}`;
        toast.error(message);
        setUser(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown network error';
      toast.error(`Failed to connect to server: ${message}`);
      setUser(null);
    }
  }, [setUser]);

  const handleSetLocalOnly = () => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            name: nameInput || prev.name,
            role: roleInput || prev.role,
            updatedAt: new Date().toISOString()
          }
        : null
    );
    toast.info('setUser만 호출됨 (DB에는 저장되지 않음)');
  };

  const handleSaveToDB = async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput || user.name,
          role: roleInput || user.role
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData?.error || 'DB 저장 실패');
        return;
      }
      await fetchUserInfo();
      toast.success('DB에 저장하고 context 재동기화 완료!');

      // const updatedUser = await res.json();
      // setUser(updatedUser);
      // toast.success('DB에 저장하고 context 업데이트 완료!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`서버 요청 실패: ${message}`);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserInfo();
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [isLoaded, isSignedIn, fetchUserInfo, setUser]);

  if (!isLoaded) return <div>Loading authentication...</div>;
  if (!isSignedIn) return <div>Please sign in to view your information.</div>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Context 테스트 페이지</h1>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="text-red-500">오류: {error}</p>
      ) : user ? (
        <div className="mb-4">
          <p>이름: {user.name ?? 'N/A'}</p>
          <p>이메일: {user.email}</p>
          <p>역할: {user.role}</p>
          <p>Clerk ID: {user.clerkId}</p>
        </div>
      ) : (
        <p>유저 없음</p>
      )}

      <div className="space-y-2">
        <input
          type="text"
          placeholder="이름 입력"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          placeholder="역할 입력"
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setUser(null);
              toast.warning('User context 초기화 완료 (setUser(null))');
            }}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            User context 초기화 (null)
          </button>
          <button
            onClick={handleSetLocalOnly}
            disabled={!user}
            className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            setUser만 호출 (로컬 상태 변경)
          </button>
          <button
            onClick={handleSaveToDB}
            disabled={!user}
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            DB에 저장 후 context 업데이트
          </button>
          <button
            onClick={fetchUserInfo}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            유저 다시 불러오기
          </button>
        </div>
      </div>
    </main>
  );
}
