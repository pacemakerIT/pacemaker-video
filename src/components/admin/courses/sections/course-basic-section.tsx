'use client';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/admin/checkbox';

type Props = {
  category: string;
  setCategory: (v: string) => void;
  isPublic: string;
  setIsPublic: (v: string) => void;
  showOnMain: boolean;
  setShowOnMain: (v: boolean) => void;
};

export default function CourseBasicSection({
  category,
  setCategory,
  isPublic,
  setIsPublic,
  showOnMain,
  setShowOnMain
}: Props) {
  return (
    <div className="flex items-center gap-10">
      <div className="flex items-center gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold">
          카테고리 선택
        </label>
        <div className="flex flex-col flex-1">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[240px] h-[48px] border border-pace-gray-300 rounded px-3 text-pace-stone-500 font-normal">
              {category || '선택'}
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md !text-pace-base font-normal">
              <SelectItem value="인터뷰">인터뷰</SelectItem>
              <SelectItem value="이력서">이력서</SelectItem>
              <SelectItem value="네트워킹">네트워킹</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-[100px] text-left text-pace-lg font-bold">
          공개여부
        </label>
        <Select value={isPublic} onValueChange={setIsPublic}>
          <SelectTrigger className="w-[240px] h-[48px] border border-pace-gray-300 rounded px-3 text-pace-stone-500 font-normal">
            {isPublic || '선택'}
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md !text-pace-base font-normal">
            <SelectItem value="공개">공개</SelectItem>
            <SelectItem value="비공개">비공개</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-[100px] text-left text-pace-lg font-bold">
          메인에 표시
        </label>
        <Checkbox
          checked={showOnMain}
          onCheckedChange={(checked) => setShowOnMain(!!checked)}
          className="w-6 h-6"
        />
      </div>
    </div>
  );
}
