'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import MainVisualForm, {
  MainVisualFormHandle
} from '@/components/admin/main-visual/main-visual-form';
import { MainVisual } from '@/types/admin/main-visual';

export default function EditMainVisualPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const formRef = useRef<MainVisualFormHandle>(null);
  const [initialData, setInitialData] = useState<Partial<MainVisual> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const resolvedParams = use(params);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/main-visual/${resolvedParams.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setInitialData({
        ...data,
        status: data.isPublic ? 'public' : 'private',
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        image: null,
        imageUrl: data.thumbnail
      });
    } catch {
      toast.error('데이터를 불러오는데 실패했습니다.');
      router.push('/admin/main-visual');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = async (data: MainVisual) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('status', data.status);
      if (data.startDate)
        formData.append('startDate', data.startDate.toISOString());
      if (data.endDate) formData.append('endDate', data.endDate.toISOString());
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      if (data.image && data.image instanceof File) {
        formData.append('image', data.image);
      }
      formData.append('imageUrl', data.imageUrl || '');
      formData.append('link', data.link);
      formData.append('linkName', data.linkName);

      const res = await fetch(`/api/main-visual/${resolvedParams.id}`, {
        method: 'PUT',
        body: formData
      });

      if (!res.ok) throw new Error('업데이트 실패');
      toast.success('성공적으로 수정되었습니다!');
      router.push('/admin/main-visual');
    } catch (err) {
      toast.error('수정 중 오류가 발생했습니다.');
      // Silencing unused err and console warning
      void err;
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10">
      <div className="flex justify-between items-center pb-10">
        <h1 className="text-pace-3xl font-bold">메인 비주얼 관리</h1>
        <button
          onClick={() => formRef.current?.submit()}
          className="w-[100px] h-[40px] bg-pace-orange-800 text-pace-white-500 rounded text-pace-base font-bold"
        >
          저장
        </button>
      </div>

      <div>
        {/* 섹션 제목 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            메인 비주얼 수정
          </span>
        </div>

        {/* 재사용 Form 컴포넌트 */}
        {initialData && (
          <MainVisualForm
            ref={formRef}
            mode="edit"
            initialData={initialData}
            onSubmit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
