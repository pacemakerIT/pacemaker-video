'use client';

import { useState } from 'react';
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
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
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
  thumbnailUrl,
  setThumbnailUrl,
  fileUrl,
  setFileUrl,
  errors
}: Props) {
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // /api/images/upload 사용 (기존 어드민 이미지 업로드 툴과 동일)
  const uploadImage = async (
    file: File,
    column: string,
    onSuccess: (url: string) => void,
    onError?: (msg: string) => void
  ) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('table', 'Document');
    formData.append('column', column);

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (res.ok && data.image?.url) {
      onSuccess(data.image.url);
    } else {
      onError?.(data.error || '업로드에 실패했습니다.');
    }
  };

  const handleThumbnailChange = async (file: File | null) => {
    if (!file) {
      setThumbnailUrl('');
      return;
    }
    setThumbnailUploading(true);
    try {
      await uploadImage(file, 'thumbnail', (url) => {
        // S3 URL에서 파일명 추출 → proxy URL로 변환
        const fileName = url.split('/').pop() || '';
        const proxyUrl = `/api/images/proxy?fileName=${encodeURIComponent(fileName)}`;
        setThumbnailUrl(proxyUrl);
      });
    } catch {
      // noop
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    setFileUploadError(null);
    setUploadedFileName(null);

    try {
      await uploadImage(
        file,
        'bucketUrl',
        (url: string) => {
          setFileUrl(url);
          setUploadedFileName(file.name);
        },
        (msg: string) => setFileUploadError(msg)
      );
    } catch {
      setFileUploadError('네트워크 오류가 발생했습니다.');
    } finally {
      setFileUploading(false);
    }
  };

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
              disabled={fileUploading}
              onChange={handleFileChange}
            />
            {fileUploading && (
              <span className="text-sm text-pace-gray-500 whitespace-nowrap">
                업로드 중...
              </span>
            )}
          </div>
          {(uploadedFileName || fileUrl) && !fileUploading && (
            <p className="text-sm text-pace-blue-600 mt-1 truncate">
              ✓ {uploadedFileName ?? fileUrl}
            </p>
          )}
          {fileUploadError && (
            <p className="text-sm text-pace-orange-500 mt-1">
              {fileUploadError}
            </p>
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
          {thumbnailUploading && (
            <p className="text-sm text-pace-gray-500">업로드 중...</p>
          )}
          <ImageUploadInput
            value={null}
            imageUrl={
              thumbnailUrl
                ? thumbnailUrl.startsWith('/api/images/proxy')
                  ? thumbnailUrl
                  : `/api/images/proxy?fileName=${encodeURIComponent(thumbnailUrl.split('/').pop() || '')}`
                : ''
            }
            placeholder="파일 선택"
            onChange={handleThumbnailChange}
          />
          <ErrorText message={errors?.thumbnail} />
        </div>
      </div>
    </>
  );
}
