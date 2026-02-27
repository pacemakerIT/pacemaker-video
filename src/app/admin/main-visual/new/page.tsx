'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import MainVisualForm from '@/components/admin/main-visual/main-visual-form';
import { MainVisual } from '@/types/admin/main-visual';

export default function CreateMainVisualPage() {
  const router = useRouter();

  const handleCreate = async (data: MainVisual) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('status', data.status); // API handles mapping status to isPublic
      if (data.startDate)
        formData.append('startDate', data.startDate.toISOString());
      if (data.endDate) formData.append('endDate', data.endDate.toISOString());
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      if (data.image) formData.append('image', data.image);
      formData.append('link', data.link);
      formData.append('linkName', data.linkName);

      const res = await fetch('/api/main-visual', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('등록 실패');
      toast.success('성공적으로 등록되었습니다!');
      router.push('/admin/main-visual');
    } catch {
      toast.error('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">메인 비주얼 관리</h1>
      </div>

      <div>
        {/* 섹션 제목 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            메인 비주얼 추가
          </span>
        </div>

        {/* 재사용 Form 컴포넌트 */}
        <MainVisualForm mode="create" onSubmit={handleCreate} />
      </div>
    </div>
  );
}
