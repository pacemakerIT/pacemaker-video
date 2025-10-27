'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { User } from '@/types/user';

/**
 * useUserContext 사용법
 *
 * 1. layout.tsx에서 <UserProvider>로 감싸기
 * 2. 컴포넌트에서:
 *
 *    const { user, isLoading, error, updateUser } = useUserContext();
 *    const name = user?.name && user.name !== 'N/A'
 *      ? user.name
 *      : user?.email?.split('@')[0] ?? '회원';
 *
 * 3. user 구조 예시:
 *    {
 *      name: 'Seulgi',
 *      email: 'seulgi-dev@gmail.com',
 *      roleId: 'ADMIN',
 *      clerkId: 'user_xxxxx',
 *      nickname: 'seulgi123'
 *    }
 *
 * 4. updateUser 사용법:
 *    // API 성공 후 로컬 상태 업데이트 (추가 API 호출 없음)
 *    updateUser({ nickname: '새닉네임' });
 *
 */

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (updates: Partial<User>) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
  setUser: () => {},
  updateUser: () => {}
});

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return '회원';

  if (user.nickname) return user.nickname;
  if (user.name) return user.name;
  return user.email.split('@')[0];
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUser(data[0] as User);
        } else if (!Array.isArray(data) && data) {
          setUser(data as User);
        } else {
          setError('User data not found in database.');
          setUser(null);
        }
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ error: 'Unknown API error' }));
        const message =
          errorData?.error || `Failed to fetch user: ${res.statusText}`;
        setError(message);
        setUser(null);
        if (res.status !== 401) {
          toast.error(message);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown network error';
      const fullMessage = `Failed to connect to server: ${message}`;
      setError(fullMessage);
      setUser(null);
      toast.error(fullMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUser();
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isLoaded, isSignedIn]);

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        setUser,
        updateUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
