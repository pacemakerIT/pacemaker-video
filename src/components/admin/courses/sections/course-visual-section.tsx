'use client';

import Input from '@/components/ui/admin/input';
import ErrorText from '@/components/ui/admin/error-text';
import { CourseFormErrors } from '@/types/admin/course-form-errors';

type Props = {
  visualTitle: string;
  setVisualTitle: (v: string) => void;
  visualTitle2: string;
  setVisualTitle2: (v: string) => void;
  errors?: CourseFormErrors;
};

export default function CourseVisualSection({
  visualTitle,
  setVisualTitle,
  visualTitle2,
  setVisualTitle2,
  errors
}: Props) {
  return (
    <>
      {/* 비주얼 타이틀 1 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          비주얼 타이틀 1<span className="text-pace-orange-500 ml-1">*</span>
        </label>
        <div className="flex flex-col flex-1">
          <Input
            type="text"
            value={visualTitle}
            onChange={(e) => setVisualTitle(e.target.value)}
            placeholder="타이틀명 입력"
          />
          <ErrorText message={errors?.visualTitle} />
        </div>
      </div>

      {/* 비주얼 타이틀 2 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          비주얼 타이틀 2<span className="text-pace-orange-500 ml-1">*</span>
        </label>
        <div className="flex flex-col flex-1">
          <Input
            type="text"
            value={visualTitle2}
            onChange={(e) => setVisualTitle2(e.target.value)}
            placeholder="타이틀명 입력"
          />
          <ErrorText message={errors?.visualTitle2} />
        </div>
      </div>
    </>
  );
}
