'use client';

import ExpandableCards from '@/components/common/expandable-cards';
import AddButton from '@/components/ui/admin/add-button';
import InstructorSection from '@/components/admin/common/instructor-section';
import RequiredMark from '@/components/ui/admin/required-mark';

export type InstructorData = {
  name: string;
  intro: string;
  careers: {
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }[];
  photo: File | null;
  photoUrl: string;
};

export type InstructorError = {
  name?: string;
  intro?: string;
  careers?: {
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }[];
  photo?: string;
};

type Props = {
  instructors: InstructorData[];
  onChange: (instructors: InstructorData[]) => void;
  errors?: InstructorError[];
};

const EMPTY_INSTRUCTOR: InstructorData = {
  name: '',
  intro: '',
  careers: [{ startDate: '', endDate: '', description: '', isCurrent: false }],
  photo: null,
  photoUrl: ''
};

export default function InstructorListSection({
  instructors,
  onChange,
  errors
}: Props) {
  const handleAdd = () => {
    onChange([
      ...instructors,
      {
        ...EMPTY_INSTRUCTOR,
        careers: [
          { startDate: '', endDate: '', description: '', isCurrent: false }
        ]
      }
    ]);
  };

  const handleDelete = (index: number) => {
    onChange(instructors.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          강사 소개
          <RequiredMark />
        </label>
        <div className="flex-1 flex flex-col gap-6">
          <ExpandableCards
            items={instructors.map((instructor, i) => ({
              id: i.toString(),
              title: instructor.name || `강사 ${i + 1}`,
              content: (
                <InstructorSection
                  value={instructor}
                  onChange={(updated) => {
                    const next = [...instructors];
                    next[i] = updated;
                    onChange(next);
                  }}
                  error={errors?.[i]}
                />
              )
            }))}
            expandLabel="수정"
            collapseLabel="닫기"
            className="max-w-none mx-0"
            onDelete={
              instructors.length > 1
                ? (id) => handleDelete(parseInt(id))
                : undefined
            }
          />
          <div className="flex justify-end">
            <AddButton label="강사 추가" onClick={handleAdd} />
          </div>
        </div>
      </div>
    </div>
  );
}
