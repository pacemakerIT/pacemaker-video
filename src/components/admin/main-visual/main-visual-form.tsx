'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import DateInput from '@/components/ui/date-input';
import TimeInput from '@/components/ui/time-input';
import ImageUploadInput from '@/components/ui/image-upload-input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { MainVisual } from '@/types/admin/main-visual';

type MainVisualFormProps = {
  initialData?: Partial<MainVisual>; // 수정 시 초기값
  mode: 'create' | 'edit'; // 등록/수정 모드
  onSubmit: (data: MainVisual) => void; // any 대신 MainVisual 타입 사용
};

export default function MainVisualForm({
  initialData,
  mode,
  onSubmit
}: MainVisualFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [status, setStatus] = useState<'' | 'public' | 'private'>(
    initialData?.status ?? ''
  );

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate
  );
  const [startTime, setStartTime] = useState(initialData?.startTime || '');
  const [endTime, setEndTime] = useState(initialData?.endTime || '');
  const [image, setImage] = useState<File | null>(
    initialData?.image instanceof File ? initialData.image : null
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [linkName] = useState(initialData?.linkName || '');
  const [tempLink, setTempLink] = useState(initialData?.link || '');
  const [tempLinkName, setTempLinkName] = useState(initialData?.linkName || '');

  // 🔹추가: 에러 상태 관리
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    status?: string;
    period?: string;
    image?: string;
    link?: string;
    linkName?: string;
  }>({});

  // 시작일 변경
  const handleStartDateChange = (date?: Date) => {
    if (endDate && date && date > endDate) {
      toast.error('시작일은 종료일보다 앞서야 합니다.');
      return;
    }
    setStartDate(date);
  };

  // 종료일 변경
  const handleEndDateChange = (date?: Date) => {
    if (startDate && date && startDate > date) {
      toast.error('종료일은 시작일보다 뒤여야 합니다.');
      return;
    }
    setEndDate(date);
  };

  // 시작시간 변경
  const handleStartTimeChange = (time: string) => {
    if (startDate && endDate && startDate.getTime() === endDate.getTime()) {
      if (endTime && time > endTime) {
        toast.error('시작시간은 종료시간보다 앞서야 합니다.');
        return;
      }
    }
    setStartTime(time);
  };

  // 종료시간 변경
  const handleEndTimeChange = (time: string) => {
    if (startDate && endDate && startDate.getTime() === endDate.getTime()) {
      if (startTime && time < startTime) {
        toast.error('종료시간은 시작시간보다 뒤여야 합니다.');
        return;
      }
    }
    setEndTime(time);
  };

  // 최종 제출
  const handleSubmit = () => {
    const newErrors: typeof errors = {};

    // 필수값 체크
    if (!title.trim()) newErrors.title = '비주얼 제목을 입력해주세요.';
    if (!description.trim())
      newErrors.description = '설명 문구를 입력해주세요.';
    if (!status) newErrors.status = '공개 여부를 선택해주세요.';
    if (!startDate || !endDate || !startTime || !endTime)
      newErrors.period = '게시기간을 선택해주세요.';
    if (!image && !imageUrl) newErrors.image = '이미지를 업로드해주세요.';
    if (!tempLink || !tempLinkName)
      newErrors.link = '링크 또는 이름을 등록해주세요.';

    setErrors(newErrors);

    // 에러 없을 때만 제출
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        title,
        description,
        status,
        startDate,
        endDate,
        startTime,
        endTime,
        image,
        link,
        linkName
      });
    }
  };

  return (
    <div className="w-full pt-10">
      <div className="flex flex-col gap-6 pb-10">
        {/* 비주얼 제목 */}
        <div className="flex items-start gap-6">
          <label className="text-pace-lg font-bold text-left mt-3 w-[216px]">
            비주얼 제목<span className="text-pace-orange-500 ml-1">*</span>
          </label>
          <div className="flex flex-col flex-1">
            <input
              type="text"
              placeholder="타이틀명 입력"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className="border border-pace-gray-300 rounded p-3"
            />
            {errors.title && (
              <p className="text-pace-orange-500 text-sm mt-1">
                {errors.title}
              </p>
            )}
          </div>
        </div>

        {/* 설명 문구 */}
        <div className="flex items-start gap-6">
          <label className="text-pace-lg font-bold text-left mt-3 w-[216px]">
            설명 문구<span className="text-pace-orange-500 ml-1">*</span>
          </label>
          <div className="flex flex-col flex-1">
            <textarea
              placeholder="설명문구 입력"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className="border border-pace-gray-300 rounded p-3 h-[120px]"
            />
            {errors.description && (
              <p className="text-pace-orange-500 text-sm mt-1">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* 공개 여부 */}
        <div className="flex items-start gap-6">
          <label className="w-[216px] text-pace-lg font-bold text-left">
            공개 여부<span className="text-pace-orange-500 ml-1">*</span>
          </label>
          <div className="flex flex-col flex-1">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as '' | 'public' | 'private');
                setErrors((prev) => ({ ...prev, status: undefined }));
              }}
            >
              <SelectTrigger className="w-[216px] h-[48px] px-3 border border-gray-300 rounded bg-white !text-pace-base">
                <span
                  className={
                    status === ''
                      ? 'text-pace-stone-500 font-normal'
                      : 'text-pace-gray-700 font-bold'
                  }
                >
                  {status === ''
                    ? '선택'
                    : status === 'public'
                      ? '공개중'
                      : '비공개'}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md !text-pace-base">
                <SelectItem
                  value="public"
                  className="!text-pace-base text-pace-gray-700 font-bold"
                >
                  공개중
                </SelectItem>
                <SelectItem
                  value="private"
                  className="!text-pace-base text-pace-stone-500 font-normal"
                >
                  비공개
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-pace-orange-500 text-sm mt-1">
                {errors.status}
              </p>
            )}
          </div>
        </div>

        {/* 게시기간 */}
        <div className="flex items-start gap-6">
          <label className="text-pace-lg font-bold text-left w-[216px]">
            게시기간<span className="text-pace-orange-500 ml-1">*</span>
          </label>
          <div className="flex flex-col flex-1">
            <div className="flex gap-4">
              <DateInput
                placeholder="시작일 선택"
                value={startDate}
                onChange={handleStartDateChange}
              />
              <TimeInput value={startTime} onChange={handleStartTimeChange} />
              <span className="self-center">-</span>
              <DateInput
                placeholder="종료일 선택"
                value={endDate}
                onChange={handleEndDateChange}
              />
              <TimeInput value={endTime} onChange={handleEndTimeChange} />
            </div>
            {errors.period && (
              <p className="text-pace-orange-500 text-sm mt-1">
                {errors.period}
              </p>
            )}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="flex items-start gap-6">
          <label className="text-pace-lg font-bold text-left w-[216px]">
            이미지 업로드<span className="text-pace-orange-500 ml-1">*</span>
          </label>
          <div className="flex flex-col flex-1">
            <ImageUploadInput
              placeholder="파일 선택"
              value={image}
              imageUrl={imageUrl} // local state로 변경
              onChange={(file) => {
                setImage(file);
                setErrors((prev) => ({ ...prev, image: undefined }));
                if (!file) {
                  // 파일이 null이면 기존 이미지도 제거
                  setImageUrl('');
                }
              }}
            />
            {errors.image && (
              <p className="text-pace-orange-500 text-sm mt-1">
                {errors.image}
              </p>
            )}
          </div>
        </div>

        {/* 링크 연결 */}
        <div className="flex items-start gap-6">
          <label className="text-pace-lg font-bold text-left w-[216px]">
            링크 연결<span className="text-pace-orange-500 ml-1">*</span>
          </label>
          <div className="flex flex-col flex-1">
            {!link ? (
              <div className="flex items-center gap-2 rounded bg-white">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={tempLink}
                  onChange={(e) => {
                    setTempLink(e.target.value);
                    setErrors((prev) => ({ ...prev, link: undefined }));
                  }}
                  className="flex-1 p-3 text-pace-base rounded bg-transparent outline-none border border-pace-gray-200"
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="표시할 이름"
                    value={tempLinkName}
                    onChange={(e) => {
                      setTempLinkName(e.target.value);
                      setErrors((prev) => ({ ...prev, linkName: undefined }));
                    }}
                    className="w-full p-3 pr-10 text-pace-base rounded bg-transparent outline-none border border-pace-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!tempLink.trim() || !tempLinkName.trim()) {
                        setErrors((prev) => ({
                          ...prev,
                          link: !tempLink ? 'URL을 입력해주세요.' : prev.link,
                          linkName: !tempLinkName
                            ? '표시할 이름을 입력해주세요.'
                            : prev.linkName
                        }));
                        return;
                      }
                      setLink(tempLinkName);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Image
                      src="/icons/link.svg"
                      alt="등록"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-pace-gray-300 rounded bg-white px-3 py-2">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pace-base text-pace-blue-600 underline truncate flex-1"
                >
                  {linkName || link}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setLink('');
                    setTempLink('');
                    setTempLinkName('');
                  }}
                  className="ml-3 text-pace-stone-500 hover:text-pace-gray-900"
                >
                  ✕
                </button>
              </div>
            )}
            {(errors.link || errors.linkName) && (
              <div className="flex flex-col">
                {errors.link && (
                  <p className="text-pace-orange-500 text-sm mt-1">
                    {errors.link}
                  </p>
                )}
                {errors.linkName && (
                  <p className="text-pace-orange-500 text-sm mt-1">
                    {errors.linkName}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center gap-2 justify-end pb-6 border-t border-pace-gray-200 pt-10">
        <Link href="/admin/main-visual">
          <button className="w-[112px] h-[60px] bg-pace-white-500 text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded flex items-center justify-center">
            취소
          </button>
        </Link>
        <button
          onClick={handleSubmit}
          className={`w-[112px] h-[60px] rounded text-pace-white-500
            ${mode === 'create' ? 'bg-pace-gray-700' : 'bg-pace-stone-500'}`}
        >
          {mode === 'create' ? '등록' : '수정'}
        </button>
      </div>
    </div>
  );
}
