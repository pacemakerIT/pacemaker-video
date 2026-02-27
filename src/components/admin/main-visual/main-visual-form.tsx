import { useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import DateInput from '@/components/ui/date-input';
import TimeInput from '@/components/ui/admin/time-input';
import ImageUploadInput from '@/components/ui/admin/image-upload-input';
import PaceSelect from '@/components/ui/admin/select';
import { MainVisual } from '@/types/admin/main-visual';
import Textarea from '@/components/ui/admin/textarea';
import Input from '@/components/ui/admin/input';
import ErrorText from '@/components/ui/admin/error-text';

type MainVisualFormProps = {
  initialData?: Partial<MainVisual>;
  mode: 'create' | 'edit';
  onSubmit: (data: MainVisual) => void;
};

export type MainVisualFormHandle = {
  submit: () => void;
};

const MainVisualForm = forwardRef<MainVisualFormHandle, MainVisualFormProps>(
  ({ initialData, onSubmit }, ref) => {
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
    const [linkName, setLinkName] = useState(initialData?.linkName || '');
    const [tempLink, setTempLink] = useState(initialData?.link || '');
    const [tempLinkName, setTempLinkName] = useState(
      initialData?.linkName || ''
    );

    const [errors, setErrors] = useState<{
      title?: string;
      description?: string;
      status?: string;
      period?: string;
      image?: string;
      link?: string;
      linkName?: string;
    }>({});

    useImperativeHandle(ref, () => ({
      submit: handleSubmit
    }));

    // 시작일 변경
    const handleStartDateChange = (date?: Date) => {
      if (endDate && date && date > endDate) {
        toast.error('시작일은 종료일보다 앞서야 합니다.');
        return;
      }

      if (
        date &&
        endDate &&
        startTime &&
        endTime &&
        date.getTime() === endDate.getTime()
      ) {
        if (startTime > endTime) {
          toast.error('시작시간은 종료시간보다 앞서야 합니다.');
          return;
        }
      }
      setStartDate(date);
    };

    // 종료일 변경
    const handleEndDateChange = (date?: Date) => {
      if (startDate && date && startDate > date) {
        toast.error('종료일은 시작일보다 뒤여야 합니다.');
        return;
      }
      if (
        startDate &&
        date &&
        startTime &&
        endTime &&
        startDate.getTime() === date.getTime()
      ) {
        if (endTime < startTime) {
          toast.error('종료시간은 시작시간보다 뒤여야 합니다.');
          return;
        }
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

      if (!title.trim()) newErrors.title = '비주얼 제목을 입력해주세요.';
      if (!description.trim())
        newErrors.description = '설명 문구를 입력해주세요.';
      if (!status) newErrors.status = '공개 여부를 선택해주세요.';
      if (!tempLink || !tempLinkName)
        newErrors.link = '링크 또는 이름을 등록해주세요.';

      setErrors(newErrors);

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
        <div className="flex flex-col gap-6 pb-20">
          {/* 비주얼 제목 */}
          <div className="flex items-start gap-6">
            <label className="text-pace-lg font-bold text-left mt-3 w-[216px] shrink-0">
              비주얼 제목
            </label>
            <div className="flex flex-col flex-1">
              <Input
                type="text"
                placeholder="타이틀명 입력"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
              />
              <ErrorText message={errors.title} />
            </div>
          </div>

          {/* 설명 문구 */}
          <div className="flex items-start gap-6">
            <label className="text-pace-lg font-bold text-left mt-3 w-[216px] shrink-0">
              설명 문구
            </label>
            <div className="flex flex-col flex-1">
              <Textarea
                placeholder="설명문구 입력"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                className="h-[216px] resize-none"
              />
              <ErrorText message={errors.description} />
            </div>
          </div>

          {/* 공개 여부 */}
          <div className="flex items-start gap-6">
            <label className="text-pace-lg font-bold text-left mt-2 w-[216px] shrink-0">
              공개 여부
            </label>

            <div className="flex flex-col flex-1">
              <PaceSelect
                value={status}
                onChange={(v) => {
                  setStatus(v as '' | 'public' | 'private');
                  setErrors((prev) => ({ ...prev, status: undefined }));
                }}
                width="w-[216px]"
                placeholder="선택"
                options={[
                  { value: 'public', label: '공개' },
                  { value: 'private', label: '비공개' }
                ]}
              />

              <ErrorText message={errors.status} />
            </div>
          </div>

          {/* 게시기간 */}
          <div className="flex items-start gap-6">
            <label className="text-pace-lg font-bold text-left mt-2 w-[216px] shrink-0">
              게시기간
            </label>
            <div className="flex flex-col flex-1">
              <div className="flex gap-4 items-center">
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
              <ErrorText message={errors.period} />
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="flex items-start gap-6">
            <label className="text-pace-lg font-bold text-left mt-3 w-[216px] shrink-0">
              이미지 업로드
            </label>
            <div className="flex flex-col flex-1 gap-4">
              {image || imageUrl ? (
                <div className="flex items-center gap-4 py-2">
                  <div className="w-[84px] h-[58px] relative rounded overflow-hidden">
                    <Image
                      src={image ? URL.createObjectURL(image) : imageUrl}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-pace-base text-pace-gray-700 flex-1 truncate">
                    {image ? image.name : '파일명 입니다_파일명 입니다.png'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImageUrl('');
                    }}
                    className="text-pace-stone-500 hover:text-pace-gray-900 px-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <ImageUploadInput
                  placeholder="파일 선택"
                  value={image}
                  imageUrl={imageUrl}
                  onChange={(file) => {
                    setImage(file);
                    setErrors((prev) => ({ ...prev, image: undefined }));
                    if (!file) {
                      setImageUrl('');
                    }
                  }}
                />
              )}
              <ErrorText message={errors.image} />
            </div>
          </div>

          {/* 링크 연결 */}
          <div className="flex items-start gap-6">
            <label className="text-pace-lg font-bold text-left mt-3 w-[216px] shrink-0">
              링크 연결
            </label>

            <div className="flex flex-col flex-1">
              {!link ? (
                <div className="flex items-center gap-2 rounded bg-white">
                  <Input
                    type="text"
                    placeholder="https://example.com"
                    value={tempLink}
                    onChange={(e) => {
                      setTempLink(e.target.value);
                      setErrors((prev) => ({ ...prev, link: undefined }));
                    }}
                    className="flex-1 border border-pace-gray-200"
                  />

                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="표시할 이름"
                      value={tempLinkName}
                      onChange={(e) => {
                        setTempLinkName(e.target.value);
                        setErrors((prev) => ({ ...prev, linkName: undefined }));
                      }}
                      className="w-full pr-10 border border-pace-gray-200"
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
                        setLink(tempLink);
                        setLinkName(tempLinkName);
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
                <div className="flex items-center justify-between py-3">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pace-base text-pace-gray-700 truncate flex-1"
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
                    className="ml-3 text-pace-stone-500 hover:text-pace-gray-900 px-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              <ErrorText message={errors.link} />
              <ErrorText message={errors.linkName} />
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center gap-2 justify-end pb-6 border-t border-pace-gray-200 pt-10">
          <Link href="/admin/main-visual">
            <button className="w-[112px] h-[60px] bg-pace-white-500 text-pace-lg text-pace-gray-700 border border-pace-gray-700 rounded flex items-center justify-center">
              취소
            </button>
          </Link>
          <button
            onClick={handleSubmit}
            className="w-[112px] h-[60px] rounded text-pace-white-500 bg-pace-gray-700 text-pace-lg"
          >
            수정
          </button>
        </div>
      </div>
    );
  }
);

MainVisualForm.displayName = 'MainVisualForm';

export default MainVisualForm;
