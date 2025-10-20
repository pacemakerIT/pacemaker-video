'use client';

import MainVisualForm from '@/components/admin/main-visual/main-visual-form';
import { MainVisual } from '@/types/admin/main-visual';

export default function CreateMainVisualPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreate = (data: MainVisual) => {
    // TODO: API POST 요청
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
            메인 비주얼 추가
          </span>
        </div>

        {/* 재사용 Form 컴포넌트 */}
        <MainVisualForm mode="create" onSubmit={handleCreate} />
      </div>
    </div>
  );
}
