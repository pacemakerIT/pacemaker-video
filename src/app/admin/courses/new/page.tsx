'use client';

import CourseForm from '@/components/admin/courses/course-form';

export default function CourseNewPage() {
  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">온라인 강의 관리</h1>
        {/* TODO: DB 완료 후 저장 기능 추가 */}
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>
      <div>
        {/* 온라인 강의 리스트 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            온라인 강의 등록
          </span>
        </div>

        <CourseForm />
      </div>
    </div>
  );
}
