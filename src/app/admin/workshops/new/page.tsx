'use client';

import AddForm from '@/components/admin/add-form';

export default function WorkshopNewPage() {
  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">워크샵 관리</h1>
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>
      <div>
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            워크샵 등록
          </span>
        </div>

        <AddForm formType="workshop" />
      </div>
    </div>
  );
}
