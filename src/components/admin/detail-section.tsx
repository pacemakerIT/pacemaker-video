'use client';
import React from 'react';

import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import FileUploadInput from '@/components/ui/admin/file-upload-input';
import TimeInput from '@/components/ui/admin/time-input';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import ErrorText from '@/components/ui/admin/error-text';
import { CourseFormErrors } from '@/types/admin/course-form-errors';
import { EbookFormErrors } from '@/types/admin/ebook-form-errors';
import { resolveImageSrc } from '@/lib/utils';
import RequiredMark from '@/components/ui/admin/required-mark';

type Props = {
  formType: 'course' | 'ebook';
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
  // shared
  price: string;
  setPrice: (v: string) => void;
  time?: string;
  setTime?: (v: string) => void;
  // thumbnail: courses use File + url; ebooks use only thumbnailUrl
  thumbnail?: File | null;
  setThumbnail?: (file: File | null) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
  // ebook-specific
  subTitle?: string;
  setSubTitle?: (v: string) => void;
  subDescription?: string;
  setSubDescription?: (v: string) => void;
  fileUrl?: string;
  setFileUrl?: (v: string) => void;
  errors?: CourseFormErrors | EbookFormErrors;
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
  price,
  setPrice,
  time,
  setTime,
  thumbnail,
  setThumbnail,
  thumbnailUrl,
  setThumbnailUrl,
  subTitle,
  setSubTitle,
  subDescription,
  setSubDescription,
  fileUrl,
  setFileUrl,
  errors
}: Props) {
  const isEbook = formType === 'ebook';
  const isCourse = formType === 'course';
  const courseErrors = errors as CourseFormErrors | undefined;
  const ebookErrors = errors as EbookFormErrors | undefined;
  const typeLabel = isEbook ? '전자책' : '강의';
  const [isUploading, setIsUploading] = React.useState(false);

  const handleThumbnailChange = async (file: File | null) => {
    // course: accept File and upload using type param
    if (isEbook) {
      // ebooks don't pass File-based thumbnail here in some flows
      if (!setThumbnailUrl) return;
      if (!file) {
        setThumbnailUrl('');
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('table', 'Ebook');
        formData.append('column', 'thumbnail');

        const res = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.image?.url) {
          setThumbnailUrl(data.image.url);
        }
      } catch (error) {
        void error;
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // course
    setThumbnail?.(file ?? null);
    if (!file) {
      setThumbnailUrl('');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'COURSE_THUMBNAIL');

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      // Proxy-compatible fileName if present, else URL
      setThumbnailUrl(data.image?.fileName || data.image?.url || data.url);
    } catch (error) {
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

      {/* 강의: 진행 제목/내용 | 전자책: 서브타이틀/설명 */}
      {isEbook ? (
        <>
          {/* 전자책 진행 제목 */}
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              전자책 진행 제목
            </label>
            <div className="flex flex-col flex-1">
              <Input
                type="text"
                value={subTitle ?? ''}
                onChange={(e) => setSubTitle?.(e.target.value)}
                placeholder="진행 제목 입력"
              />
            </div>
          </div>

          {/* 전자책 진행 내용 */}
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              전자책 진행 내용
            </label>
            <div className="flex flex-col flex-1">
              <Textarea
                value={subDescription ?? ''}
                onChange={(e) => setSubDescription?.(e.target.value)}
                placeholder="진행 내용 입력"
                className="h-[120px]"
              />
            </div>
          </div>

          {/* 전자책 업로드 (File) */}
          <div className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              전자책 업로드
              <RequiredMark />
            </label>
            <div className="flex flex-col gap-2 flex-1">
              <FileUploadInput
                placeholder={isUploading ? '업로드 중...' : '파일 선택'}
                fileUrl={fileUrl ?? ''}
                fileName={undefined}
                onChange={
                  setFileUrl
                    ? async (f: File | null) => {
                        if (!f) {
                          setFileUrl?.('');
                          return;
                        }
                        // perform same upload as ebook-detail used to do
                        setIsUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append('image', f);
                          formData.append('table', 'Ebook');
                          formData.append('column', 'bucketUrl');

                          const res = await fetch('/api/images/upload', {
                            method: 'POST',
                            body: formData
                          });
                          const data = await res.json();
                          if (res.ok && data.image?.url) {
                            setFileUrl?.(data.image.url);
                          }
                        } finally {
                          setIsUploading(false);
                        }
                      }
                    : undefined
                }
              />
              <ErrorText message={isEbook ? ebookErrors?.file : undefined} />
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
              <ErrorText
                message={isCourse ? courseErrors?.videoLink : undefined}
              />
            </div>
          </div>
        </>
      )}

      {/* 금액 / 시간 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          {`금액 / ${typeLabel} 시간`}
          <RequiredMark />
        </label>
        <div className="flex gap-6 flex-wrap">
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
            <ErrorText message={courseErrors?.price ?? ebookErrors?.price} />
          </div>

          <div className="flex flex-col">
            <TimeInput
              value={time}
              onChange={setTime}
              placeholder="시간 선택"
            />
            <ErrorText message={isCourse ? courseErrors?.time : undefined} />
          </div>
        </div>
      </div>

      {/* 썸네일 업로드 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          썸네일 이미지 업로드
          <RequiredMark />
        </label>
        <div className="flex flex-col gap-2 flex-1">
          {isEbook ? (
            <>
              {isUploading && (
                <p className="text-sm text-pace-gray-500">업로드 중...</p>
              )}
              <ImageUploadInput
                value={null}
                imageUrl={resolveImageSrc({ thumbnail: thumbnailUrl })}
                placeholder={isUploading ? '업로드 중...' : '파일 선택'}
                onChange={(f) => handleThumbnailChange(f ?? null)}
              />
            </>
          ) : (
            <ImageUploadInput
              value={thumbnail ?? null}
              imageUrl={thumbnailUrl}
              placeholder={isUploading ? '업로드 중...' : '파일 선택'}
              onChange={handleThumbnailChange}
            />
          )}
          <ErrorText message={errors?.thumbnail} />
        </div>
      </div>
    </>
  );
}
