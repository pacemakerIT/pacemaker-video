'use client';

import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import TimeInput from '@/components/ui/admin/time-input';
import Textarea from '@/components/ui/admin/textarea';

type Props = {
  title: string;
  setTitle: (v: string) => void;
  intro: string;
  setIntro: (v: string) => void;
  videoLink: string;
  setVideoLink: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
};

export default function CourseDetailSection({
  title,
  setTitle,
  intro,
  setIntro,
  videoLink,
  setVideoLink,
  price,
  setPrice,
  time,
  setTime,
  thumbnail,
  setThumbnail,
  thumbnailUrl,
  setThumbnailUrl
}: Props) {
  return (
    <>
      {/* 강의 제목 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          강의 제목
        </label>
        <div className="flex flex-col flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="타이틀명 입력"
            className="border border-pace-gray-300 rounded p-3"
          />
        </div>
      </div>

      {/* 강의 소개 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          강의 소개 내용
        </label>
        <div className="flex flex-col flex-1">
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="강의 소개 입력"
            className="h-[200px]" // 필요 시 높이 지정 가능
          />
        </div>
      </div>

      {/* 동영상 링크 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          동영상 링크
        </label>
        <div className="flex flex-col flex-1">
          <input
            type="text"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="링크 입력"
            className="border border-pace-gray-300 rounded p-3"
          />
        </div>
      </div>

      {/* 금액 / 강의 시간 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          금액 / 강의 시간
        </label>
        <div className="flex gap-6 flex-wrap">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pace-gray-500 font-bold">
              $
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="입력"
              inputMode="numeric"
              className="w-[240px] h-[48px] border border-pace-gray-300 rounded p-3 pl-9"
            />
          </div>
          <TimeInput value={time} onChange={setTime} placeholder="시간 선택" />
        </div>
      </div>

      {/* 썸네일 업로드 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          썸네일 이미지 업로드
        </label>
        <div className="flex flex-col gap-2 flex-1">
          <ImageUploadInput
            value={thumbnail}
            imageUrl={thumbnailUrl}
            placeholder="파일 선택"
            onChange={(file) => {
              setThumbnail(file);
              if (file) setThumbnailUrl(URL.createObjectURL(file));
              else setThumbnailUrl('');
            }}
          />
        </div>
      </div>
    </>
  );
}
