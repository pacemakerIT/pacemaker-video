'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode
} from 'react';

import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/common/confirm-modal';

type NavigationBlockerContextType = {
  isBlocked: boolean;
  setBlocked: (blocked: boolean) => void;
  attemptNavigation: (href: string) => void;
};

const NavigationBlockerContext = createContext<
  NavigationBlockerContextType | undefined
>(undefined);

export function NavigationBlockerProvider({
  children
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  const setBlocked = useCallback((blocked: boolean) => {
    setIsBlocked(blocked);
  }, []);

  useEffect(() => {
    if (!isBlocked) return;

    // 블로킹 활성화 시 현재 페이지를 히스토리에 한 번 더 쌓음 (함정 설치)
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // 뒤로가기를 누르면 이 이벤트가 발생하고, 함정이 제거됨.
      // 다시 함정을 설치해서 현재 페이지 유지
      window.history.pushState(null, '', window.location.href);
      setTargetPath('BACK');
      setIsModalOpen(true);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // 컴포넌트 언마운트나 블로킹 해제 시 함정 제거 로직이 필요할 수 있으나,
      // 복잡성을 피하기 위해 여기서는 생략 (사용자가 저장 후 이동하면 자연스럽게 해결됨)
    };
  }, [isBlocked]);

  const attemptNavigation = useCallback(
    (href: string) => {
      if (isBlocked) {
        setTargetPath(href);
        setIsModalOpen(true);
      } else {
        router.push(href);
      }
    },
    [isBlocked, router]
  );

  const handleConfirm = useCallback(() => {
    setBlocked(false); // Unblock
    setIsModalOpen(false);

    if (targetPath === 'BACK') {
      router.back(); // 함정으로 인해 두 번 뒤로 가야 할 수도 있지만, 일단 back() 호출
      router.back(); // PushState로 추가된 함정을 건너뛰고 진짜 이전 페이지로 이동
    } else if (targetPath) {
      router.push(targetPath);
    }
    setTargetPath(null);
  }, [targetPath, router, setBlocked]);

  return (
    <NavigationBlockerContext.Provider
      value={{ isBlocked, setBlocked, attemptNavigation }}
    >
      {children}
      <ConfirmModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="페이지 이동"
        description={
          '저장되지 않은 변경사항이 있습니다.\n정말 이동하시겠습니까?'
        }
        onConfirm={handleConfirm}
        confirmText="이동"
        cancelText="취소"
      />
    </NavigationBlockerContext.Provider>
  );
}

export function useNavigationBlocker() {
  const context = useContext(NavigationBlockerContext);
  if (context === undefined) {
    throw new Error(
      'useNavigationBlocker must be used within a NavigationBlockerProvider'
    );
  }
  return context;
}
