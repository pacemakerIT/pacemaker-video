'use client';

import { toast } from 'sonner';
import MainVisualForm from '@/components/admin/main-visual/main-visual-form';
import { MainVisual } from '@/types/admin/main-visual';

export default function CreateMainVisualPage() {
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
      if (data.image) formData.append('image', data.image);
      formData.append('link', data.link);

      const res = await fetch(`/api/main-visual/123`, {
        method: 'PUT',
        body: formData
      });

      if (!res.ok) throw new Error('업데이트 실패');
      alert('성공적으로 수정되었습니다!');
    } catch (err) {
      toast.error('수정 중 오류가 발생했습니다.' + err);
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">메인 비주얼 관리</h1>
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
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
        <MainVisualForm
          mode="edit"
          initialData={{
            title: '메인 비주얼 제목입니다.',
            description: '메인 비주얼 설명 문구 영역입니다...',
            status: 'public',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-12-31'),
            startTime: '23:59',
            endTime: '00:00',
            image: 'null', // 서버에서 URL 받는 경우는 다르게 처리
            imageUrl: '/img/ebook_image1.png', // 서버에서 받은 기존 이미지
            link: '연결된 링크입니다'
          }}
          onSubmit={handleEdit}
        />
      </div>
    </div>
  );
}
