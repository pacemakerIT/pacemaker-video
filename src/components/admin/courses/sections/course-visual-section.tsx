'use client';

import Input from '@/components/ui/admin/input';

type Props = {
  visualTitle: string;
  setVisualTitle: (v: string) => void;
  visualTitle2: string;
  setVisualTitle2: (v: string) => void;
};

export default function CourseVisualSection({
  visualTitle,
  setVisualTitle,
  visualTitle2,
  setVisualTitle2
}: Props) {
  return (
    <>
      {/* 비주얼 타이틀 1 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          비주얼 타이틀 1
        </label>
        <div className="flex flex-col flex-1">
          <Input
            type="text"
            value={visualTitle}
            onChange={(e) => setVisualTitle(e.target.value)}
            placeholder="타이틀명 입력"
          />
        </div>
      </div>

      {/* 비주얼 타이틀 2 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          비주얼 타이틀 2
        </label>
        <div className="flex flex-col flex-1">
          <Input
            type="text"
            value={visualTitle2}
            onChange={(e) => setVisualTitle2(e.target.value)}
            placeholder="타이틀명 입력"
          />
        </div>
      </div>
    </>
  );
}
