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
  const [link, setLink] = useState(initialData?.link || '');
  const [linkName] = useState(initialData?.linkName || '');
  const [tempLink, setTempLink] = useState(initialData?.link || '');
  const [tempLinkName, setTempLinkName] = useState(initialData?.linkName || '');

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
    // 필수값 체크
    if (!title.trim()) {
      toast.error('비주얼 제목을 입력해주세요.');
      return;
    }

    if (!description.trim()) {
      toast.error('설명 문구를 입력해주세요.');
      return;
    }

    if (!status) {
      toast.error('공개 여부를 선택해주세요.');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('게시기간을 선택해주세요.');
      return;
    }

    if (!image && !initialData?.imageUrl) {
      toast.error('이미지를 업로드해주세요.');
      return;
    }
    if (!tempLink) {
      toast.error('링크를 등록해주세요.');
      return;
    }

    if (!tempLinkName) {
      toast.error('링크이름을 등록해주세요.');
      return;
    }
    // 검증 통과 → 제출
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
  };

  return (
    <div className="w-full pt-10">
      <div className="flex flex-col gap-6 pb-10">
        {/* 비주얼 제목 */}
        <div className="flex items-center gap-6">
          <label className="text-pace-lg font-bold text-left w-[216px]">
            비주얼 제목
          </label>
          <input
            type="text"
            placeholder="타이틀명 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border border-pace-gray-300 rounded p-3"
          />
        </div>

        {/* 설명 문구 */}
        <div className="flex items-start gap-6">
          <label className="text-pace-lg font-bold text-left mt-3 w-[216px]">
            설명 문구
          </label>
          <textarea
            placeholder="설명문구 입력"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 border border-pace-gray-300 rounded p-3 h-[120px]"
          />
        </div>

        {/* 공개 여부 */}
        <div className="flex items-center gap-6">
          <label className="w-[216px] text-pace-lg font-bold text-left">
            공개 여부
          </label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as '' | 'public' | 'private')
            }
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
              {' '}
              <SelectItem
                value="public"
                className="!text-pace-base text-pace-gray-700 font-bold"
              >
                {' '}
                공개중{' '}
              </SelectItem>{' '}
              <SelectItem
                value="private"
                className="!text-pace-base text-pace-stone-500 font-normal"
              >
                {' '}
                비공개{' '}
              </SelectItem>{' '}
            </SelectContent>
          </Select>
        </div>

        {/* 게시기간 */}
        <div className="flex items-center gap-6">
          <label className="text-pace-lg font-bold text-left w-[216px]">
            게시기간
          </label>
          <div className="flex flex-1 gap-4">
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
        </div>

        {/* 이미지 업로드 */}
        <div className="flex items-center gap-6">
          <label className="text-pace-lg font-bold text-left w-[216px]">
            이미지 업로드
          </label>
          <div className="w-[488px]">
            <ImageUploadInput
              placeholder="파일 선택"
              value={image}
              imageUrl={initialData?.imageUrl}
              onChange={setImage}
            />
          </div>
        </div>

        {/* 링크 연결 */}
        <div className="flex items-center gap-6">
          <label className="text-pace-lg font-bold text-left w-[216px]">
            링크 연결
          </label>
          <div className="w-[488px]">
            {!link ? (
              // 링크 없을 때 → 입력창
              <div className="flex items-center gap-2 rounded bg-white">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={tempLink}
                  onChange={(e) => setTempLink(e.target.value)}
                  className="flex-1 p-3 text-pace-base rounded bg-transparent outline-none border border-pace-gray-200"
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="표시할 이름"
                    value={tempLinkName}
                    onChange={(e) => setTempLinkName(e.target.value)}
                    className="w-full p-3 pr-10 text-pace-base rounded bg-transparent outline-none border border-pace-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!tempLink.trim() || !tempLinkName.trim()) {
                        toast.error('URL과 표시할 이름을 입력해주세요.');
                        return;
                      }
                      setLink(tempLink);
                      // setLinkName(tempLinkName); // 필요하다면 수정
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
              // 등록된 링크
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
