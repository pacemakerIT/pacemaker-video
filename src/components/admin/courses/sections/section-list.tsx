'use client';

import { useState } from 'react';
import AddButton from '@/components/ui/admin/add-button';
import Textarea from '@/components/ui/admin/textarea';

export default function SectionList() {
  const [sections, setSections] = useState([{ title: '', content: '' }]);

  // 섹션 추가
  const handleAddSection = () => {
    setSections([...sections, { title: '', content: '' }]);
  };

  // 입력 변경
  const handleChange = (
    index: number,
    field: 'title' | 'content',
    value: string
  ) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  return (
    <div className="flex items-start gap-6">
      {/* 왼쪽 라벨 */}
      <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
        섹션 별 내용
      </label>

      {/* 오른쪽 섹션 입력 영역 */}
      <div className="flex-1 flex flex-col gap-6">
        {sections.map((section, index) => (
          <div key={index} className="flex flex-col gap-4">
            {/* 섹션 제목 */}
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
                섹션 {index + 1} 제목
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
                placeholder={`섹션 ${index + 1} 제목 입력`}
                className="flex-1 border border-pace-gray-300 rounded p-3"
              />
            </div>

            {/* 섹션 내용 */}
            <div className="flex items-start gap-4">
              <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500 mt-3">
                섹션 {index + 1} 내용
              </label>
              <Textarea
                value={section.content}
                onChange={(e) => handleChange(index, 'content', e.target.value)}
                placeholder={`섹션 ${index + 1} 내용 입력`}
                className="flex-1 h-[200px]" // 필요 시 높이 지정 가능
              />
            </div>
          </div>
        ))}

        {/* 섹션 추가 버튼 */}
        <AddButton label="섹션 추가" onClick={handleAddSection} />
      </div>
    </div>
  );
}
