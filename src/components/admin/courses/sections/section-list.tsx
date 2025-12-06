'use client';

import AddButton from '@/components/ui/admin/add-button';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import RequiredMark from '@/components/ui/admin/required-mark';

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

export default function SectionList({
  value = [],
  onChange,
  errors = []
}: SectionListProps) {
  // 섹션 추가
  const handleAddSection = () => {
    onChange([
      ...value,
      { title: '', content: '', videos: [{ title: '', link: '' }] }
    ]);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-6">
        {/* 왼쪽 라벨 */}
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          섹션 별 내용
        </label>

        {/* 오른쪽 섹션 입력 영역 */}
        <div className="flex-1 flex flex-col gap-6">
          {value.map((section, index) => (
            <div key={index} className="flex flex-col gap-4">
              {/* 섹션 제목 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500">
                    섹션 {index + 1} 제목
                    <RequiredMark />
                  </label>

                  <Input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleChange(index, 'title', e.target.value)
                    }
                    placeholder={`섹션 ${index + 1} 제목 입력`}
                    className="flex-1"
                  />
                </div>
                {errors[index]?.title && (
                  <p className="text-pace-orange-500 text-sm pl-[136px]">
                    {errors[index].title}
                  </p>
                )}
              </div>

              {/* 섹션 내용 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-4">
                  <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500 mt-3">
                    섹션 {index + 1} 내용
                    <RequiredMark />
                  </label>

                  <Textarea
                    value={section.content}
                    onChange={(e) =>
                      handleChange(index, 'content', e.target.value)
                    }
                    placeholder={`섹션 ${index + 1} 내용 입력`}
                    className="flex-1 h-[200px]"
                  />
                </div>
                {errors[index]?.content && (
                  <p className="text-pace-orange-500 text-sm pl-[136px]">
                    {errors[index].content}
                  </p>
                )}
              </div>

              {/* 비디오 리스트 */}
              {section.videos?.map((video, vIndex) => (
                <div key={vIndex} className="flex flex-col gap-2 mt-2">
                  <div className="flex items-start gap-4">
                    <label className="w-[120px] text-pace-lg font-semibold text-pace-black-500 mt-3">
                      영상 {vIndex + 1}
                    </label>

                    <div className="flex-1 flex flex-col gap-2">
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
                        {/* 마지막 비디오 항목에만 추가 버튼 표시 (또는 항상 표시?) 
                            스크린샷에는 버튼이 하나만 보임. 
                            보통 이런 리스트에서는 하단에 추가 버튼이 있거나, 
                            각 항목 옆에 삭제/추가 버튼이 있음.
                            스크린샷: "영상 링크 추가 +" 버튼이 인풋 옆에 있음.
                        */}
                        {vIndex === section.videos.length - 1 && (
                          <AddButton
                            label="영상 링크 추가"
                            onClick={() => handleAddVideo(index)}
                            className="whitespace-nowrap"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* 섹션 추가 버튼 */}
          <AddButton label="섹션 추가" onClick={handleAddSection} />
        </div>
      </div>
    </div>
  );
}
