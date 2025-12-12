'use client';

import AddButton from '@/components/ui/admin/add-button';
import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import { Checkbox } from '@/components/ui/admin/checkbox';
import PaceSelect from '@/components/ui/admin/select';
import { toast } from 'sonner';

import RequiredMark from '@/components/ui/admin/required-mark';

type Career = {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
};

type Instructor = {
  name: string;
  intro: string;
  careers: Career[];
  photo: File | null;
  photoUrl: string;
};

type InstructorSectionProps = {
  value: Instructor;
  onChange: (instructor: Instructor) => void;
  error?: {
    name?: string;
    intro?: string;
    careers?: { startDate?: string; endDate?: string; description?: string }[];
    photo?: string;
  };
};

export default function InstructorSection({
  value,
  onChange,
  error
}: InstructorSectionProps) {
  const yearOptions = Array.from({ length: 50 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}년`, value: String(year) };
  });

  const handleAddCareer = () => {
    onChange({
      ...value,
      careers: [
        ...value.careers,
        { startDate: '', endDate: '', isCurrent: false, description: '' }
      ]
    });
  };

  const handleCareerChange = (
    index: number,
    key: keyof Career,
    val: string | boolean
  ) => {
    const updatedCareers = [...value.careers];
    const currentCareer = updatedCareers[index];

    // Validate date range when changing endDate
    if (key === 'endDate' && typeof val === 'string') {
      const startYear = parseInt(currentCareer.startDate);
      const endYear = parseInt(val);

      if (currentCareer.startDate && val && endYear < startYear) {
        toast.error('종료 연도는 시작 연도보다 이전일 수 없습니다.');
        return; // Don't update if invalid
      }
    }

    // Validate date range when changing startDate
    if (key === 'startDate' && typeof val === 'string') {
      const startYear = parseInt(val);
      const endYear = parseInt(currentCareer.endDate);

      if (
        val &&
        currentCareer.endDate &&
        !currentCareer.isCurrent &&
        endYear < startYear
      ) {
        toast.error('시작 연도는 종료 연도보다 이후일 수 없습니다.');
        return; // Don't update if invalid
      }
    }

    updatedCareers[index] = { ...updatedCareers[index], [key]: val };
    onChange({ ...value, careers: updatedCareers });
  };

  const handleDeleteCareer = (index: number) => {
    const updatedCareers = value.careers.filter((_, i) => i !== index);
    onChange({ ...value, careers: updatedCareers });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 이름 — Input 공통 컴포넌트 적용 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
            강사 이름
            <RequiredMark />
          </label>
          <Input
            type="text"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="강사 이름 입력"
            className="flex-1"
          />
        </div>
        {error?.name && (
          <p className="text-pace-orange-500 text-sm pl-[136px]">
            {error.name}
          </p>
        )}
      </div>

      {/* 소개 내용 — textarea 그대로 유지 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
            강사 소개 <p /> 내용
            <RequiredMark />
          </label>
          <Textarea
            value={value.intro}
            onChange={(e) => onChange({ ...value, intro: e.target.value })}
            placeholder="강의 소개 내용 입력"
            className="flex-1 h-[200px]"
          />
        </div>
        {error?.intro && (
          <p className="text-pace-orange-500 text-sm pl-[136px]">
            {error.intro}
          </p>
        )}
      </div>

      {/* 이력 목록 */}
      {value.careers.map((career, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
              이력 내용
              <RequiredMark />
            </label>
            <div className="flex items-center gap-3 flex-1">
              <label className="w-[30px] text-pace-base text-pace-stone-500">
                날짜
              </label>
              <PaceSelect
                value={career.startDate}
                onChange={(val) => handleCareerChange(i, 'startDate', val)}
                options={yearOptions}
                placeholder="선택"
                width="w-[100px]"
              />
              <span>-</span>
              <PaceSelect
                value={career.endDate}
                onChange={(val) => handleCareerChange(i, 'endDate', val)}
                options={yearOptions}
                placeholder="선택"
                width="w-[100px]"
                disabled={career.isCurrent}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={career.isCurrent}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    const updatedCareers = [...value.careers];
                    updatedCareers[i] = {
                      ...updatedCareers[i],
                      isCurrent: isChecked,
                      endDate: isChecked ? '' : updatedCareers[i].endDate
                    };
                    onChange({ ...value, careers: updatedCareers });
                  }}
                  className="w-5 h-5"
                />
                <label className="text-pace-base text-pace-stone-500 whitespace-nowrap">
                  현재 근무중
                </label>
              </div>
              <label className="text-pace-base text-pace-stone-500">내용</label>
              <input
                type="text"
                value={career.description}
                onChange={(e) =>
                  handleCareerChange(i, 'description', e.target.value)
                }
                placeholder="내용 입력"
                className="flex-1 border border-pace-gray-300 rounded p-2"
              />
              {value.careers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteCareer(i)}
                  className="text-pace-orange-500 hover:text-pace-orange-600 flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {error?.careers?.[i] && (
            <div className="pl-[136px] flex flex-col gap-1">
              {error.careers[i]?.startDate && (
                <p className="text-pace-orange-500 text-sm">
                  {error.careers[i].startDate}
                </p>
              )}
              {error.careers[i]?.endDate && (
                <p className="text-pace-orange-500 text-sm">
                  {error.careers[i].endDate}
                </p>
              )}
              {error.careers[i]?.description && (
                <p className="text-pace-orange-500 text-sm">
                  {error.careers[i].description}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      <AddButton label="이력 추가" onClick={handleAddCareer} />

      {/* 강사 사진 업로드 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
            강사 사진
            <RequiredMark />
          </label>
          <ImageUploadInput
            value={value.photo}
            imageUrl={value.photoUrl}
            placeholder="파일 선택"
            onChange={(file) => {
              if (file) {
                onChange({
                  ...value,
                  photo: file,
                  photoUrl: URL.createObjectURL(file)
                });
              } else {
                onChange({
                  ...value,
                  photo: null,
                  photoUrl: ''
                });
              }
            }}
          />
        </div>
        {error?.photo && (
          <p className="text-pace-orange-500 text-sm pl-[136px]">
            {error.photo}
          </p>
        )}
      </div>
    </div>
  );
}
