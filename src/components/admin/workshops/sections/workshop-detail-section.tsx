'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import TimeInput from '@/components/ui/admin/time-input';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import ErrorText from '@/components/ui/admin/error-text';
import RequiredMark from '@/components/ui/admin/required-mark';
import { WorkshopFormErrors } from '@/types/admin/workshop-form-errors';

type Props = {
  title: string;
  setTitle: (v: string) => void;
  intro: string;
  setIntro: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  processContent: string;
  setProcessContent: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
  errors?: WorkshopFormErrors;
};

export default function WorkshopDetailSection({
  title,
  setTitle,
  intro,
  setIntro,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
  location,
  setLocation,
  processContent,
  setProcessContent,
  price,
  setPrice,
  thumbnail,
  setThumbnail,
  thumbnailUrl,
  setThumbnailUrl,
  errors
}: Props) {
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
      formData.append('type', 'WORKSHOP_THUMBNAIL');
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setThumbnailUrl(data.url);
    } catch (e) {
      void e;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* 워크샵 제목 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          워크샵 제목
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

      {/* 워크샵 소개 내용 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          워크샵 소개 내용
          <RequiredMark />
        </label>
        <div className="flex flex-col flex-1">
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="워크샵 소개 입력"
            className="h-[200px]"
          />
          <ErrorText message={errors?.intro} />
        </div>
      </div>

      {/* 시작 일자 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          시작 일자
          <RequiredMark />
        </label>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[240px] h-[48px] border border-pace-gray-300 rounded px-3 text-pace-gray-700 placeholder:text-pace-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <Calendar className="absolute right-3 top-1/4 text-stone-500" />
            </div>
            <ErrorText message={errors?.startDate} />
          </div>
          <div className="flex flex-col">
            <TimeInput
              value={startTime}
              onChange={setStartTime}
              placeholder="시간 선택"
            />
          </div>
        </div>
      </div>

      {/* 종료 일자 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          종료 일자
          <RequiredMark />
        </label>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[240px] h-[48px] border border-pace-gray-300 rounded px-3 text-pace-gray-700 placeholder:text-pace-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <Calendar className="absolute right-3 top-1/4 text-stone-500" />
            </div>
            <ErrorText message={errors?.endDate} />
          </div>
          <div className="flex flex-col">
            <TimeInput
              value={endTime}
              onChange={setEndTime}
              placeholder="시간 선택"
            />
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="워크샵 장소 입력"
          />
          <ErrorText message={errors?.location} />
        </div>
      </div>

      {/* 워크샵 진행 내용 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          워크샵 진행 내용
        </label>
        <div className="flex flex-col flex-1">
          <Textarea
            value={processContent}
            onChange={(e) => setProcessContent(e.target.value)}
            placeholder="워크샵 진행 내용 입력"
            className="h-[200px]"
          />
        </div>
      </div>

      {/* 금액 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          금액
          <RequiredMark />
        </label>
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
            imageUrl={thumbnailUrl}
            placeholder={isUploading ? '업로드 중...' : '파일 선택'}
            onChange={handleThumbnailChange}
          />
          <ErrorText message={errors?.thumbnail} />
        </div>
      </div>
    </>
  );
}
