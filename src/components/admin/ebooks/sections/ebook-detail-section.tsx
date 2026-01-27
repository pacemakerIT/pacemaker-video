'use client';

import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import ErrorText from '@/components/ui/admin/error-text';
import { EbookFormErrors } from '@/types/admin/ebook-form-errors';
import RequiredMark from '@/components/ui/admin/required-mark';

type Props = {
  title: string;
  setTitle: (v: string) => void;
  intro: string;
  setIntro: (v: string) => void;
  processTitle: string;
  setProcessTitle: (v: string) => void;
  processContent: string;
  setProcessContent: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
  setFile: (file: File | null) => void;
  fileUrl: string;
  setFileUrl: (v: string) => void;
  errors?: EbookFormErrors;
};

export default function EbookDetailSection({
  title,
  setTitle,
  intro,
  setIntro,
  processTitle,
  setProcessTitle,
  processContent,
  setProcessContent,
  price,
  setPrice,
  thumbnail,
  setThumbnail,
  thumbnailUrl,
  setThumbnailUrl,
  setFile,
  fileUrl,
  setFileUrl,
  errors
}: Props) {
  return (
    <>
      {/* 전자책 제목 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          전자책 제목
          <RequiredMark />
        </label>
        <div className="flex flex-col flex-1">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 입력"
          />
          <ErrorText message={errors?.title} />
        </div>
      </div>

      {/* 전자책 소개 내용 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          전자책 소개 내용
          <RequiredMark />
        </label>
        <div className="flex flex-col flex-1">
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="전자책 소개 입력"
            className="h-[200px]"
          />
          <ErrorText message={errors?.intro} />
        </div>
      </div>

      {/* 전자책 진행 제목 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          전자책 진행 제목
        </label>
        <div className="flex flex-col flex-1">
          <Input
            type="text"
            value={processTitle}
            onChange={(e) => setProcessTitle(e.target.value)}
            placeholder="전자책 진행 제목 입력"
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
            value={processContent}
            onChange={(e) => setProcessContent(e.target.value)}
            placeholder="전자책 진행 내용 입력"
            className="h-[200px]"
          />
        </div>
      </div>

      {/* 전자책 업로드 (File) */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          전자책 업로드
          <RequiredMark />
        </label>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-pace-gray-100 file:text-pace-gray-700
                  hover:file:bg-pace-gray-200
                "
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f) setFileUrl(f.name);
              }}
            />
          </div>
          {fileUrl && (
            <p className="text-sm text-gray-500 mt-1">현재 파일: {fileUrl}</p>
          )}
          <ErrorText message={errors?.file} />
        </div>
      </div>

      {/* 금액 */}
      <div className="flex items-start gap-6">
        <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
          금액
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
            <ErrorText message={errors?.price} />
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
          <ErrorText message={errors?.thumbnail} />
        </div>
      </div>
    </>
  );
}
