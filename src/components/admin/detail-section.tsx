'use client';
import React from 'react';

import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import TimeInput from '@/components/ui/admin/time-input';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import ErrorText from '@/components/ui/admin/error-text';
import { CourseFormErrors } from '@/types/admin/course-form-errors';
import RequiredMark from '@/components/ui/admin/required-mark';
import { FormType } from '@/components/admin/add-form';
import { Calendar } from 'lucide-react';
import { resolveImageSrc } from '@/lib/utils';

type Props = {
  formType: FormType;
  title: string;
  setTitle: (v: string) => void;
  intro: string;
  setIntro: (v: string) => void;
  // course-only
  processTitle?: string;
  setProcessTitle?: (v: string) => void;
  processContent?: string;
  setProcessContent?: (v: string) => void;
  videoLink?: string;
  setVideoLink?: (v: string) => void;
  // workshop-only
  workshopDate?: string;
  setWorkshopDate?: (v: string) => void;
  workshopTime?: string;
  setWorkshopTime?: (v: string) => void;
  workshopLocation?: string;
  setWorkshopLocation?: (v: string) => void;
  workshopProcessContent?: string;
  setWorkshopProcessContent?: (v: string) => void;
  priceNote?: string;
  setPriceNote?: (v: string) => void;
  // shared
  // Shared
  price: string;
  setPrice: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
  errors?: CourseFormErrors;
};

export default function DetailSection({
  formType,
  title,
  setTitle,
  intro,
  setIntro,
  processTitle,
  setProcessTitle,
  processContent,
  setProcessContent,
  videoLink,
  setVideoLink,
  workshopDate,
  setWorkshopDate,
  workshopTime,
  setWorkshopTime,
  workshopLocation,
  setWorkshopLocation,
  workshopProcessContent,
  setWorkshopProcessContent,
  priceNote,
  setPriceNote,
  price,
  setPrice,
  time,
  setTime,
  thumbnail,
  setThumbnail,
  thumbnailUrl,
  setThumbnailUrl,
  errors
}: Props) {
  const isWorkshop = formType === 'workshop';
  const typeLabel = isWorkshop ? '워크샵' : '강의';
  const [isUploading, setIsUploading] = React.useState(false);

  const handleThumbnailChange = async (file: File | null) => {
    setThumbnail(file);
    if (!file) {
      setThumbnailUrl('');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'type',
        isWorkshop ? 'WORKSHOP_THUMBNAIL' : 'COURSE_THUMBNAIL'
      );

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      // Proxy-compatible fileName if present, else URL
      setThumbnailUrl(data.image?.fileName || data.image?.url || data.url);
    } catch (error) {
      // Intentionally silent for lint consistency
      void error;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* 제목 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          {typeLabel} 제목
          <RequiredMark />
        </label>
        <div className="flex flex-col flex-1">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="타이틀명 입력"
          />
          <ErrorText message={errors?.title} />
        </div>
      </div>

      {/* 소개 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          {typeLabel} 소개 내용
          <RequiredMark />
        </label>
        <div className="flex flex-col flex-1">
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder={`${typeLabel} 소개 입력`}
            className="h-[200px]"
          />
          <ErrorText message={errors?.intro} />
        </div>
      </div>

      {/* 강의: 진행 제목/내용 | 워크샵: 일자+시간 / 장소 / 진행 내용 */}
      {isWorkshop ? (
        <>
          {/* 워크샵 일자 + 시간 (금액 필드 너비만큼, 오른쪽 여백 남김) */}
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              워크샵 일자
            </label>
            <div className="flex gap-4">
              {/* 날짜 */}
              <div className="flex flex-col">
                <div className="relative">
                  <input
                    type="date"
                    value={workshopDate ?? ''}
                    placeholder="MM/DD/YYYY"
                    onChange={(e) => setWorkshopDate?.(e.target.value)}
                    className="w-[240px] h-[48px] border border-pace-gray-300 rounded px-3 text-pace-gray-700 placeholder:text-pace-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <Calendar className="absolute right-3 top-1/4 text-stone-500" />
                </div>
                <ErrorText message={errors?.workshopDate} />
              </div>

              {/* 시간 */}
              <div className="flex flex-col">
                <TimeInput
                  value={workshopTime ?? ''}
                  onChange={(e) => setWorkshopTime?.(e)}
                  placeholder="시간 선택"
                />
                <ErrorText message={errors?.time} />
              </div>
            </div>
          </div>

          {/* 워크샵 장소 */}
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              워크샵 장소
            </label>
            <div className="flex flex-col flex-1">
              <Input
                type="text"
                value={workshopLocation ?? ''}
                onChange={(e) => setWorkshopLocation?.(e.target.value)}
                placeholder="워크샵 장소 입력"
              />
              <ErrorText message={errors?.workshopLocation} />
            </div>
          </div>

          {/* 워크샵 진행 내용 */}
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              워크샵 진행 내용
            </label>
            <div className="flex flex-col flex-1">
              <Textarea
                value={workshopProcessContent ?? ''}
                onChange={(e) => setWorkshopProcessContent?.(e.target.value)}
                placeholder="워크샵 진행 내용 입력"
                className="h-[200px]"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              강의 진행 제목
            </label>
            <div className="flex flex-col flex-1">
              <Input
                type="text"
                value={processTitle ?? ''}
                onChange={(e) => setProcessTitle?.(e.target.value)}
                placeholder="강의 진행 제목 입력"
              />
            </div>
          </div>

          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              강의 진행 내용
            </label>
            <div className="flex flex-col flex-1">
              <Textarea
                value={processContent ?? ''}
                onChange={(e) => setProcessContent?.(e.target.value)}
                placeholder="강의 진행 내용 입력"
                className="h-[200px]"
              />
            </div>
          </div>

          {/* 동영상 링크 (course only) */}
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              동영상 링크
              <RequiredMark />
            </label>
            <div className="flex flex-col flex-1">
              <Input
                type="text"
                value={videoLink ?? ''}
                onChange={(e) => setVideoLink?.(e.target.value)}
                placeholder="링크 입력"
              />
              <ErrorText message={errors?.videoLink} />
            </div>
          </div>
        </>
      )}

      {/* 금액 / 시간 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          {isWorkshop ? '금액' : `금액 / ${typeLabel} 시간`}
          <RequiredMark />
        </label>
        <div className={`flex gap-6 ${isWorkshop ? 'flex-1' : 'flex-wrap'}`}>
          <div className="flex flex-col">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pace-gray-500 font-bold">
                $
              </span>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="입력"
                inputMode="numeric"
                className="w-[240px] h-[48px] pl-9"
              />
            </div>
            <ErrorText message={errors?.price} />
          </div>

          {isWorkshop ? (
            <div className="flex flex-col flex-1">
              <Input
                type="text"
                value={priceNote ?? ''}
                onChange={(e) => setPriceNote?.(e.target.value)}
                placeholder="추가 내용 입력"
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <TimeInput
                value={time}
                onChange={setTime}
                placeholder="시간 선택"
              />
              <ErrorText message={errors?.time} />
            </div>
          )}
        </div>
      </div>

      {/* 썸네일 업로드 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          썸네일 이미지 업로드
          <RequiredMark />
        </label>
        <div className="flex flex-col gap-2 flex-1">
          <ImageUploadInput
            value={thumbnail}
            imageUrl={resolveImageSrc({ thumbnail: thumbnailUrl })}
            placeholder={isUploading ? '업로드 중...' : '파일 선택'}
            onChange={handleThumbnailChange}
          />
          <ErrorText message={errors?.thumbnail} />
        </div>
      </div>
    </>
  );
}
