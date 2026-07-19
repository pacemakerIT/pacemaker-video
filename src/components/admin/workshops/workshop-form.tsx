'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import CourseBasicSection from '@/components/admin/basic-section';
import WorkshopDetailSection from '@/components/admin/workshops/sections/workshop-detail-section';
import SectionList from '@/components/admin/common/section-list';
import InstructorListSection, {
  InstructorData
} from '@/components/admin/common/instructor-list-section';
import ActionButtons from '@/components/admin/common/action-buttons';
import { WorkshopFormErrors } from '@/types/admin/workshop-form-errors';

export type WorkshopData = {
  category: string;
  recruitStatus: string;
  showOnMain: boolean;
  title: string;
  intro: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  processContent: string;
  price: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  sections: {
    title: string;
    content: string;
    videos?: { title: string; link: string }[];
  }[];
  instructors: InstructorData[];
};

const buildDateTime = (date: string, time: string): string => {
  if (!date) return '';
  return time ? `${date}T${time}:00` : `${date}T00:00:00`;
};

const INITIAL_DATA: WorkshopData = {
  category: '',
  recruitStatus: '',
  showOnMain: false,
  title: '',
  intro: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  location: '',
  processContent: '',
  price: '',
  thumbnail: null,
  thumbnailUrl: '',
  sections: [{ title: '', content: '', videos: [{ title: '', link: '' }] }],
  instructors: [
    {
      name: '',
      intro: '',
      careers: [
        { startDate: '', endDate: '', description: '', isCurrent: false }
      ],
      photo: null,
      photoUrl: ''
    }
  ]
};

type Props = {
  initialData?: WorkshopData;
  isEdit?: boolean;
  workshopId?: string;
};

export default function WorkshopForm({
  initialData,
  isEdit = false,
  workshopId
}: Props) {
  const [data, setData] = useState<WorkshopData>(initialData ?? INITIAL_DATA);
  const [errors, setErrors] = useState<WorkshopFormErrors>({});

  const update = <K extends keyof WorkshopData>(
    key: K,
    value: WorkshopData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof WorkshopFormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: WorkshopFormErrors = {};

    if (!data.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!data.recruitStatus)
      newErrors.recruitStatus = '모집 여부를 선택해주세요.';
    if (!data.title.trim()) newErrors.title = '제목을 입력해주세요.';
    if (!data.intro.trim()) newErrors.intro = '소개를 입력해주세요.';
    if (!data.startDate.trim())
      newErrors.startDate = '시작 일자를 선택해주세요.';
    if (!data.endDate.trim()) newErrors.endDate = '종료 일자를 선택해주세요.';
    if (!data.price.trim()) newErrors.price = '가격을 입력해주세요.';
    if (!data.thumbnail && !data.thumbnailUrl)
      newErrors.thumbnail = '썸네일 이미지를 업로드해주세요.';

    const sectionErrors = data.sections.map((section) => {
      const errs: { title?: string; content?: string } = {};
      if (!section.title.trim()) errs.title = '섹션 제목을 입력해주세요.';
      if (!section.content.trim()) errs.content = '섹션 내용을 입력해주세요.';
      return Object.keys(errs).length > 0 ? errs : {};
    });
    if (sectionErrors.some((e) => Object.keys(e).length > 0)) {
      newErrors.sections = sectionErrors;
    }

    const instructorErrors = data.instructors.map((inst) => {
      const errs: NonNullable<WorkshopFormErrors['instructors']>[number] = {};
      if (!inst.name.trim()) errs.name = '강사 이름을 입력해주세요.';
      if (!inst.intro.trim()) errs.intro = '강사 소개를 입력해주세요.';
      if (!inst.photo && !inst.photoUrl)
        errs.photo = '강사 사진을 업로드해주세요.';

      const careerErrors = inst.careers.map((career) => {
        const cErrs: {
          startDate?: string;
          endDate?: string;
          description?: string;
        } = {};
        if (!career.startDate.trim())
          cErrs.startDate = '시작일을 입력해주세요.';
        if (!career.isCurrent && !career.endDate.trim())
          cErrs.endDate = '종료일을 입력해주세요.';
        if (!career.description.trim())
          cErrs.description = '이력 내용을 입력해주세요.';
        return Object.keys(cErrs).length > 0 ? cErrs : {};
      });
      if (careerErrors.some((e) => Object.keys(e).length > 0)) {
        errs.careers = careerErrors;
      }

      return Object.keys(errs).length > 0 ? errs : {};
    });
    if (instructorErrors.some((e) => Object.keys(e).length > 0)) {
      newErrors.instructors = instructorErrors;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('필수 입력 항목을 확인해주세요.');
      return;
    }

    try {
      const payload = {
        category: data.category,
        recruitStatus: data.recruitStatus,
        showOnMain: data.showOnMain,
        title: data.title,
        description: data.intro,
        startDate: buildDateTime(data.startDate, data.startTime),
        endDate: buildDateTime(data.endDate, data.endTime),
        location: data.location,
        processContent: data.processContent,
        price: data.price ? parseFloat(data.price) : null,
        thumbnailUrl: data.thumbnailUrl,
        sections: data.sections,
        instructors: data.instructors
      };

      const url =
        isEdit && workshopId
          ? `/api/workshops/${workshopId}`
          : '/api/workshops';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isEdit ? '수정 완료!' : '등록 완료!');
        window.location.href = '/admin/workshops';
      } else {
        const errorData = await res.json();
        toast.error(`저장 실패: ${errorData.error || 'Unknown error'}`);
      }
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <form
      id="workshop-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full mx-auto flex flex-col gap-8 pt-10 pb-16"
    >
      {/* 카테고리 / 모집여부 / 메인표시 */}
      <CourseBasicSection
        formType="workshop"
        category={data.category}
        setCategory={(v) => {
          update('category', v);
          setErrors((prev) => ({ ...prev, category: undefined }));
        }}
        statusValue={data.recruitStatus}
        setStatusValue={(v) => {
          update('recruitStatus', v);
          setErrors((prev) => ({ ...prev, recruitStatus: undefined }));
        }}
        showOnMain={data.showOnMain}
        setShowOnMain={(v) => update('showOnMain', v)}
        errors={{
          recruitStatus: errors.recruitStatus,
          category: errors.category
        }}
      />

      {/* 워크샵 정보 */}
      <WorkshopDetailSection
        title={data.title}
        setTitle={(v) => update('title', v)}
        intro={data.intro}
        setIntro={(v) => update('intro', v)}
        startDate={data.startDate}
        setStartDate={(v) => update('startDate', v)}
        startTime={data.startTime}
        setStartTime={(v) => update('startTime', v)}
        endDate={data.endDate}
        setEndDate={(v) => update('endDate', v)}
        endTime={data.endTime}
        setEndTime={(v) => update('endTime', v)}
        location={data.location}
        setLocation={(v) => update('location', v)}
        processContent={data.processContent}
        setProcessContent={(v) => update('processContent', v)}
        price={data.price}
        setPrice={(v) => update('price', v)}
        thumbnail={data.thumbnail}
        setThumbnail={(v) => update('thumbnail', v)}
        thumbnailUrl={data.thumbnailUrl}
        setThumbnailUrl={(v) => update('thumbnailUrl', v)}
        errors={errors}
      />

      {/* 커리큘럼 */}
      <SectionList
        label="커리큘럼"
        itemLabel="섹션"
        addLabel="섹션 추가"
        showVideos
        value={data.sections}
        onChange={(v) => update('sections', v)}
        errors={errors.sections}
      />

      {/* 강사 소개 */}
      <InstructorListSection
        instructors={data.instructors}
        onChange={(v) => update('instructors', v)}
        errors={errors.instructors}
      />

      {/* 버튼 */}
      <ActionButtons
        cancelHref="/admin/workshops"
        submitLabel={isEdit ? '수정' : '등록'}
        submitBehavior="submit"
      />
    </form>
  );
}
