'use client';

import PaceSelect from '@/components/ui/admin/select';
import { Checkbox } from '@/components/ui/admin/checkbox';
import ErrorText from '@/components/ui/admin/error-text';
import { CourseFormErrors } from '@/types/admin/course-form-errors';
import RequiredMark from '@/components/ui/admin/required-mark';
import { itemCategoryLabel } from '@/constants/labels';

type Props = {
  category: string;
  setCategory: (v: string) => void;
  isPublic: string;
  setIsPublic: (v: string) => void;
  showOnMain: boolean;
  setShowOnMain: (v: boolean) => void;
  errors?: CourseFormErrors;
};

export default function CourseBasicSection({
  category,
  setCategory,
  isPublic,
  setIsPublic,
  showOnMain,
  setShowOnMain,
  errors
}: Props) {
  return (
    <div className="flex items-center gap-10">
      {/* 카테고리 선택 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold h-[48px] flex items-center">
          카테고리 선택
          <RequiredMark />
        </label>
        <div className="flex flex-col flex-1">
          <PaceSelect
            value={category}
            onChange={setCategory}
            width="w-[240px]"
            placeholder="선택"
            options={[
              { value: 'INTERVIEW', label: itemCategoryLabel.en.INTERVIEW },
              { value: 'RESUME', label: itemCategoryLabel.en.RESUME },
              { value: 'NETWORKING', label: itemCategoryLabel.en.NETWORKING }
            ]}
          />

          {/* 에러 표시 */}
          <ErrorText message={errors?.category} />
        </div>
      </div>

      {/* 공개 여부 */}
      <div className="flex items-start gap-3">
        <label className="w-[100px] text-left text-pace-lg font-bold h-[48px] flex items-center">
          공개여부
          <RequiredMark />
        </label>

        <div className="flex flex-col">
          <PaceSelect
            value={isPublic}
            onChange={setIsPublic}
            width="w-[240px]"
            placeholder="선택"
            options={[
              { value: '공개', label: '공개' },
              { value: '비공개', label: '비공개' }
            ]}
          />

          {/* 에러 표시 */}
          <ErrorText message={errors?.isPublic} />
        </div>
      </div>

      {/* 메인에 표시 */}
      <div className="flex items-start gap-3">
        <label className="w-[100px] text-left text-pace-lg font-bold">
          메인에 표시
        </label>
        <div className="flex flex-col">
          <Checkbox
            checked={showOnMain}
            onCheckedChange={(checked) => setShowOnMain(!!checked)}
            className="w-6 h-6"
          />

          {/* 여기는 필수값 아님 → 에러 없음 */}
        </div>
      </div>
    </div>
  );
}
