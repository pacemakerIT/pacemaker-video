'use client';

import { useRef, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function UpdatePasswordForm() {
  const { user } = useUser();
  const currentRef = useRef<HTMLInputElement | null>(null);
  const newRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const { signOut } = useClerk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const currentPassword = currentRef.current?.value?.trim() ?? '';
    const newPassword = newRef.current?.value?.trim() ?? '';
    const confirmPassword = confirmRef.current?.value?.trim() ?? '';

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setStatus('모든 필드를 입력해주세요.');
    }
    if (newPassword !== confirmPassword) {
      return setStatus('새 비밀번호가 일치하지 않습니다.');
    }

    try {
      await user.updatePassword({
        currentPassword: currentPassword,
        newPassword: newPassword
      });
      setStatus('');
      toast('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      signOut();
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : '비밀번호 변경 중 오류가 발생했습니다.'
      );
    } finally {
      if (currentRef.current) currentRef.current.value = '';
      if (newRef.current) newRef.current.value = '';
      if (confirmRef.current) confirmRef.current.value = '';
    }
  };

  return (
    <form
      className="w-[300px] flex flex-col gap-4"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <p className="font-medium text-pace-gray-500 text-[20px]">
        비밀번호 변경
      </p>

      <div className="flex flex-col gap-2">
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="현재 비밀번호를 입력하세요"
          ref={currentRef}
          className="rounded-full border-pace-stone-650"
        />
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="새 비밀번호를 입력하세요"
          ref={newRef}
          className="rounded-full border-pace-stone-650"
        />
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="새 비밀번호를 다시 입력하세요"
          ref={confirmRef}
          className="rounded-full border-pace-stone-650"
        />
      </div>

      <Button
        type="submit"
        className="bg-pace-orange-800 text-white rounded-full"
      >
        변경
      </Button>

      {status && <p className="text-center text-pace-gray-500">{status}</p>}
    </form>
  );
}
