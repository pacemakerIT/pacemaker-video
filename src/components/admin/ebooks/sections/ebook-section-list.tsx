'use client';

import AddButton from '@/components/ui/admin/add-button';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import RequiredMark from '@/components/ui/admin/required-mark';
import ExpandableCards from '@/components/common/expandable-cards';

type Video = {
  title: string;
  link: string;
};

type Section = {
  title: string;
  content: string;
  videos: Video[];
};

type SectionListProps = {
  value: Section[];
  onChange: (sections: Section[]) => void;
  errors?: { title?: string; content?: string }[];
};

export default function EbookSectionList({
  value = [],
  onChange,
  errors = []
}: SectionListProps) {
  // 목차 추가
  const handleAddSection = () => {
    onChange([...value, { title: '', content: '', videos: [] }]);
  };

  // 입력 변경
  const handleChange = (
    index: number,
    field: 'title' | 'content',
    val: string
  ) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  // 비디오 추가
  const handleAddVideo = (sectionIndex: number) => {
    const updated = [...value];
    updated[sectionIndex].videos.push({ title: '', link: '' });
    onChange(updated);
  };

  // 비디오 입력 변경
  const handleVideoChange = (
    sectionIndex: number,
    videoIndex: number,
    field: 'title' | 'link',
    val: string
  ) => {
    const updated = [...value];
    updated[sectionIndex].videos[videoIndex][field] = val;
    onChange(updated);
  };

  // 비디오 삭제
  const handleDeleteVideo = (sectionIndex: number, videoIndex: number) => {
    const updated = [...value];
    updated[sectionIndex].videos = updated[sectionIndex].videos.filter(
      (_, i) => i !== videoIndex
    );
    onChange(updated);
  };

  // 목차 삭제
  const handleDeleteSection = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-6">
        {/* 왼쪽 라벨 */}
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          목차 별 내용
        </label>

        {/* 오른쪽 목차 입력 영역 */}
        <div className="flex-1 flex flex-col gap-6">
          <ExpandableCards
            items={value.map((section, index) => ({
              id: index.toString(),
              title: section.title || `목차 ${index + 1}`,
              content: (
                <div className="flex flex-col gap-4">
                  {/* 목차 제목 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
                        목차 {index + 1} 제목
                        <RequiredMark />
                      </label>

                      <Input
                        type="text"
                        value={section.title}
                        onChange={(e) =>
                          handleChange(index, 'title', e.target.value)
                        }
                        placeholder={`목차 ${index + 1} 제목 입력`}
                        className="flex-1"
                      />
                    </div>
                    {errors[index]?.title && (
                      <p className="text-pace-orange-500 text-sm pl-[136px]">
                        {errors[index].title}
                      </p>
                    )}
                  </div>

                  {/* 목차 내용 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500 mt-3">
                        목차 {index + 1} 내용
                        <RequiredMark />
                      </label>

                      <Textarea
                        value={section.content}
                        onChange={(e) =>
                          handleChange(index, 'content', e.target.value)
                        }
                        placeholder={`목차 ${index + 1} 내용 입력`}
                        className="flex-1 h-[200px]"
                      />
                    </div>
                    {errors[index]?.content && (
                      <p className="text-pace-orange-500 text-sm pl-[136px]">
                        {errors[index].content}
                      </p>
                    )}
                  </div>

                  {/* 비디오 리스트 (첫 번째 목차가 아닐 때만 노출) */}
                  {index > 0 && (
                    <>
                      {section.videos?.map((video, vIndex) => (
                        <div key={vIndex} className="flex flex-col gap-2 mt-2">
                          <div className="flex items-start gap-4">
                            <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500 mt-3">
                              영상 {vIndex + 1}
                            </label>

                            <div className="flex-1 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={video.title}
                                  onChange={(e) =>
                                    handleVideoChange(
                                      index,
                                      vIndex,
                                      'title',
                                      e.target.value
                                    )
                                  }
                                  placeholder={`영상 ${vIndex + 1} 제목 입력`}
                                  className="w-full"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteVideo(index, vIndex)
                                  }
                                  className="text-pace-orange-500 hover:text-pace-orange-600 flex-shrink-0"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  value={video.link}
                                  onChange={(e) =>
                                    handleVideoChange(
                                      index,
                                      vIndex,
                                      'link',
                                      e.target.value
                                    )
                                  }
                                  placeholder="링크 입력"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 영상 링크 추가 버튼 (항상 하단에 표시) */}
                      <div className="flex justify-end">
                        <AddButton
                          label="영상 링크 추가"
                          onClick={() => handleAddVideo(index)}
                          className="whitespace-nowrap"
                        />
                      </div>
                    </>
                  )}
                </div>
              )
            }))}
            expandLabel="수정"
            collapseLabel="닫기"
            className="max-w-none mx-0"
            onDelete={
              value.length > 1
                ? (id) => handleDeleteSection(parseInt(id))
                : undefined
            }
          />

          {/* 목차 추가 버튼 */}
          <AddButton label="목차 추가" onClick={handleAddSection} />
        </div>
      </div>
    </div>
  );
}
