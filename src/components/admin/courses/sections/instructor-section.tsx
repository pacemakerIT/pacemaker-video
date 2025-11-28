'use client';

import { useState } from 'react';
import AddButton from '@/components/ui/admin/add-button';
import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import Textarea from '@/components/ui/admin/textarea';

type Career = {
  startDate: string;
  endDate: string;
  description: string;
};

export default function InstructorSection() {
  const [name, setName] = useState('');
  const [intro, setIntro] = useState('');
  const [careers, setCareers] = useState<Career[]>([
    { startDate: '', endDate: '', description: '' }
  ]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  const handleAddCareer = () => {
    setCareers([...careers, { startDate: '', endDate: '', description: '' }]);
  };

  const handleCareerChange = (
    index: number,
    key: keyof Career,
    value: string
  ) => {
    const updated = [...careers];
    updated[index][key] = value;
    setCareers(updated);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 강사 소개 타이틀 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          강사 소개
        </label>

        {/* 오른쪽 강사 입력 영역 */}
        <div className="flex flex-col flex-1 gap-6">
          {/* 이름 */}
          <div className="flex items-center gap-4">
            <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
              강사 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="강사 이름 입력"
              className="flex-1 border border-pace-gray-300 rounded p-3"
            />
          </div>

          {/* 소개 내용 */}
          <div className="flex items-center gap-4">
            <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
              강사 소개 <p />
              내용
            </label>
            <Textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="강의 소개 내용 입력"
              className="flex-1 h-[200px]" // 필요 시 높이 지정 가능
            />
          </div>

          {/* 이력 목록 */}
          {careers.map((career, i) => (
            <div key={i} className="flex items-center gap-4">
              <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
                이력 내용
              </label>
              <div className="flex items-center gap-3 flex-1">
                <label className="w-[30px] text-pace-base text-pace-stone-500">
                  날짜
                </label>
                <input
                  type="text"
                  value={career.startDate}
                  onChange={(e) =>
                    handleCareerChange(i, 'startDate', e.target.value)
                  }
                  placeholder="입력"
                  className="w-[60px] border border-pace-gray-300 rounded p-2"
                />
                <span>-</span>
                <input
                  type="text"
                  value={career.endDate}
                  onChange={(e) =>
                    handleCareerChange(i, 'endDate', e.target.value)
                  }
                  placeholder="입력"
                  className="w-[60px] border border-pace-gray-300 rounded p-2"
                />
                <label className="text-pace-base text-pace-stone-500">
                  내용
                </label>
                <input
                  type="text"
                  value={career.description}
                  onChange={(e) =>
                    handleCareerChange(i, 'description', e.target.value)
                  }
                  placeholder="내용 입력"
                  className="flex-1 border border-pace-gray-300 rounded p-2"
                />
              </div>
            </div>
          ))}
          <AddButton label="이력 추가" onClick={handleAddCareer} />

          {/* 강사 사진 업로드 */}
          <div className="flex items-center gap-4">
            <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
              강사 사진
            </label>
            <ImageUploadInput
              value={photo}
              imageUrl={photoUrl}
              placeholder="파일 선택"
              onChange={(file) => {
                setPhoto(file);
                if (file) {
                  setPhotoUrl(URL.createObjectURL(file));
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
