'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import SectionList from '@/components/admin/courses/sections/section-list';
import RecommendedSelect from '@/components/admin/courses/sections/recommended-select';
import InstructorSection from '@/components/admin/courses/sections/instructor-section';
import ExpandableCards from '@/components/common/expandable-cards';
import AddButton from '@/components/ui/admin/add-button';
import RecommendedLinkSection from '@/components/admin/courses/sections/recommended-link-section';
import CourseBasicSection from '@/components/admin/basic-section';
import CourseDetailSection from '@/components/admin/detail-section';
import CourseVisualSection from '@/components/admin/courses/sections/course-visual-section';
import CourseActionButtons from '@/components/admin/courses/sections/course-action-buttons';
import { CourseFormErrors } from '@/types/admin/course-form-errors';

export type FormType = 'course' | 'workshop';

export type CourseData = {
  // course only
  isPublic?: string;
  processTitle?: string;
  processContent?: string;
  videoLink?: string;
  visualTitle?: string;
  visualTitle2?: string;
  recommended?: string[];

  // workshop only
  recruitStatus?: string;
  workshopDate?: string;
  workshopTime?: string;
  workshopLocation?: string;
  workshopProcessContent?: string;
  priceNote?: string;

  // shared
  category: string;
  showOnMain: boolean;
  title: string;
  intro: string;
  price: string;
  time: string;
  thumbnail: File | null;
  thumbnailUrl: string;

  sections: {
    title: string;
    content: string;
    videos: { title: string; link: string }[];
  }[];
  instructors: {
    name: string;
    intro: string;
    careers: {
      startDate: string;
      endDate: string;
      isCurrent: boolean;
      description: string;
    }[];
    photo: File | null;
    photoUrl: string;
  }[];
  links: {
    url: string;
    name: string;
    errors?: { url?: string; name?: string };
  }[];
};

type Props = {
  formType: FormType;
  initialData?: CourseData;
  isEdit?: boolean;
  courseId?: string;
};

export default function AddForm({
  formType,
  initialData,
  isEdit = false,
  courseId
}: Props) {
  const isCourse = formType === 'course';

  const [courseData, setCourseData] = useState<CourseData>(
    initialData || {
      category: '',
      isPublic: '',
      recruitStatus: '',
      showOnMain: false,
      title: '',
      intro: '',
      processTitle: '',
      processContent: '',
      videoLink: '',
      workshopDate: '',
      workshopTime: '',
      workshopLocation: '',
      workshopProcessContent: '',
      priceNote: '',
      price: '',
      time: '',
      thumbnail: null,
      thumbnailUrl: '',
      visualTitle: '',
      visualTitle2: '',
      recommended: [],
      sections: [{ title: '', content: '', videos: [{ title: '', link: '' }] }],
      instructors: [
        {
          name: '',
          intro: '',
          careers: [
            {
              startDate: '',
              endDate: '',
              description: '',
              isCurrent: false
            }
          ],
          photo: null,
          photoUrl: ''
        }
      ],
      links: [{ url: '', name: '', errors: {} }]
    }
  );

  const [errors, setErrors] = useState<CourseFormErrors>({});

  // 제출 함수
  const handleSubmit = async () => {
    const newErrors: CourseFormErrors = {};

    if (!courseData.category) newErrors.category = '카테고리를 선택해주세요.';

    if (isCourse) {
      if (!courseData.isPublic)
        newErrors.isPublic = '공개 여부를 선택해주세요.';
    } else {
      if (!courseData.recruitStatus)
        newErrors.recruitStatus = '모집 여부를 선택해주세요.';
    }

    if (!courseData.title.trim()) newErrors.title = '제목을 입력해주세요.';
    if (!courseData.intro.trim()) newErrors.intro = '소개를 입력해주세요.';

    if (isCourse) {
      if (!courseData.videoLink?.trim())
        newErrors.videoLink = '동영상 링크를 입력해주세요.';
    }

    if (!courseData.price.trim()) newErrors.price = '가격을 입력해주세요.';
    if (!courseData.time.trim()) newErrors.time = '시간을 입력해주세요.';

    if (!courseData.thumbnail && !courseData.thumbnailUrl)
      newErrors.thumbnail = '썸네일 이미지를 업로드해주세요.';

    if (isCourse) {
      if (!courseData.visualTitle?.trim())
        newErrors.visualTitle = '비주얼 타이틀을 입력해주세요.';
      if (!courseData.visualTitle2?.trim())
        newErrors.visualTitle2 = '비주얼 타이틀2를 입력해주세요.';
      if (!courseData.recommended?.length)
        newErrors.recommended = '추천 이미지를 최소 1개 선택해주세요.';
    }

    const hasInvalidLink = courseData.links.some(
      (l) => !l.url.trim() || !l.name.trim()
    );
    if (hasInvalidLink) newErrors.links = '링크와 이름을 모두 입력해주세요.';

    const sectionErrors = courseData.sections.map((section) => {
      const errs: { title?: string; content?: string } = {};
      if (!section.title.trim()) errs.title = '섹션 제목을 입력해주세요.';
      if (!section.content.trim()) errs.content = '섹션 내용을 입력해주세요.';
      return Object.keys(errs).length > 0 ? errs : {};
    });

    if (sectionErrors.some((err) => Object.keys(err).length > 0)) {
      newErrors.sections = sectionErrors;
    }

    const instructorErrors = courseData.instructors.map((inst) => {
      const errs: {
        name?: string;
        intro?: string;
        careers?: {
          startDate?: string;
          endDate?: string;
          isCurrent?: boolean;
          description?: string;
        }[];
        photo?: string;
      } = {};

      if (!inst.name.trim()) errs.name = '강사 이름을 입력해주세요.';
      if (!inst.intro.trim()) errs.intro = '강사 소개를 입력해주세요.';
      if (!inst.photo && !inst.photoUrl)
        errs.photo = '강사 사진을 업로드해주세요.';

      const careerErrors = inst.careers.map((career) => {
        const cErrors: {
          startDate?: string;
          endDate?: string;
          isCurrent?: boolean;
          description?: string;
        } = {};
        if (!career.startDate.trim())
          cErrors.startDate = '시작일을 입력해주세요.';
        if (!career.isCurrent && !career.endDate.trim())
          cErrors.endDate = '종료일을 입력해주세요.';
        if (!career.description.trim())
          cErrors.description = '이력 내용을 입력해주세요.';
        return Object.keys(cErrors).length > 0 ? cErrors : {};
      });

      if (careerErrors.some((err) => Object.keys(err).length > 0)) {
        errs.careers = careerErrors;
      }

      return Object.keys(errs).length > 0 ? errs : {};
    });

    if (instructorErrors.some((err) => Object.keys(err).length > 0)) {
      newErrors.instructors = instructorErrors;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('필수 입력 항목을 확인해주세요.');
      return;
    }

    try {
      // TODO: 파일 업로드(이미지 등)가 필요한 경우, 먼저 S3 등에 업로드 후 URL을 받아와서 FormData 대신 JSON으로 전송하거나, 서버 API에서 멀티파트를 처리해야 합니다.
      // 일단은 현재 폼 데이터를 POST로 보내는 기본 기능을 구현합니다.
      const payload = {
        category: courseData.category,
        isPublic: courseData.isPublic === '공개',
        showOnMain: courseData.showOnMain,
        title: courseData.title,
        description: courseData.intro,
        processTitle: courseData.processTitle,
        processContent: courseData.processContent,
        videoLink: courseData.videoLink,
        price: courseData.price,
        time: courseData.time,
        thumbnailUrl: courseData.thumbnailUrl,
        visualTitle: courseData.visualTitle,
        visualTitle2: courseData.visualTitle2,
        recommended: courseData.recommended, // Target audience labels
        sections: courseData.sections,
        instructors: courseData.instructors,
        links: courseData.links // Recommended links
      };

      const url =
        isEdit && courseId ? `/api/courses/detail/${courseId}` : '/api/courses';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isEdit ? '수정 완료!' : '등록 완료!');
        window.location.href = '/admin/courses';
      } else {
        const errorData = await res.json();
        toast.error(`저장 실패: ${errorData.error || 'Unknown error'}`);
      }
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  const updateCourseData = <K extends keyof CourseData>(
    key: K,
    value: CourseData[K]
  ) => {
    setCourseData((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof CourseFormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleAddInstructor = () => {
    updateCourseData('instructors', [
      ...courseData.instructors,
      {
        name: '',
        intro: '',
        careers: [
          {
            startDate: '',
            endDate: '',
            description: '',
            isCurrent: false
          }
        ],
        photo: null,
        photoUrl: ''
      }
    ]);
  };

  const handleDeleteInstructor = (index: number) => {
    const newInstructors = courseData.instructors.filter((_, i) => i !== index);
    updateCourseData('instructors', newInstructors);
  };

  return (
    <form
      id="course-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full mx-auto flex flex-col gap-8 pt-10 pb-16"
    >
      {/* 카테고리 / 공개여부(강의) or 모집여부(워크샵) / 메인표시 */}
      <CourseBasicSection
        formType={formType}
        category={courseData.category}
        setCategory={(v) => {
          updateCourseData('category', v);
          setErrors((prev) => ({ ...prev, category: undefined }));
        }}
        statusValue={
          isCourse
            ? (courseData.isPublic ?? '')
            : (courseData.recruitStatus ?? '')
        }
        setStatusValue={(v) => {
          if (isCourse) {
            updateCourseData('isPublic', v);
            setErrors((prev) => ({ ...prev, isPublic: undefined }));
          } else {
            updateCourseData('recruitStatus', v);
            setErrors((prev) => ({ ...prev, recruitStatus: undefined }));
          }
        }}
        showOnMain={courseData.showOnMain}
        setShowOnMain={(v) => updateCourseData('showOnMain', v)}
        errors={errors}
      />

      {/* 정보 */}
      <CourseDetailSection
        formType={formType}
        title={courseData.title}
        setTitle={(v) => updateCourseData('title', v)}
        intro={courseData.intro}
        setIntro={(v) => updateCourseData('intro', v)}
        processTitle={courseData.processTitle}
        setProcessTitle={(v) => updateCourseData('processTitle', v)}
        processContent={courseData.processContent}
        setProcessContent={(v) => updateCourseData('processContent', v)}
        videoLink={courseData.videoLink}
        setVideoLink={(v) => updateCourseData('videoLink', v)}
        workshopDate={courseData.workshopDate}
        setWorkshopDate={(v) => updateCourseData('workshopDate', v)}
        workshopTime={courseData.workshopTime}
        setWorkshopTime={(v) => updateCourseData('workshopTime', v)}
        workshopLocation={courseData.workshopLocation}
        setWorkshopLocation={(v) => updateCourseData('workshopLocation', v)}
        workshopProcessContent={courseData.workshopProcessContent}
        setWorkshopProcessContent={(v) =>
          updateCourseData('workshopProcessContent', v)
        }
        priceNote={courseData.priceNote}
        setPriceNote={(v) => updateCourseData('priceNote', v)}
        price={courseData.price}
        setPrice={(v) => updateCourseData('price', v)}
        time={courseData.time}
        setTime={(v) => updateCourseData('time', v)}
        thumbnail={courseData.thumbnail}
        setThumbnail={(v) => updateCourseData('thumbnail', v)}
        thumbnailUrl={courseData.thumbnailUrl}
        setThumbnailUrl={(v) => updateCourseData('thumbnailUrl', v)}
        errors={errors}
      />

      {/* 비주얼 타이틀 (강의 전용) */}
      {isCourse && (
        <CourseVisualSection
          visualTitle={courseData.visualTitle ?? ''}
          setVisualTitle={(v) => updateCourseData('visualTitle', v)}
          visualTitle2={courseData.visualTitle2 ?? ''}
          setVisualTitle2={(v) => updateCourseData('visualTitle2', v)}
          errors={errors}
        />
      )}

      {/* 추천드려요 (강의 전용) */}
      {isCourse && (
        <RecommendedSelect
          maxSelect={2}
          value={courseData.recommended}
          onChange={(v) => updateCourseData('recommended', v)}
          error={errors.recommended}
        />
      )}

      {/* 섹션 리스트 */}
      <SectionList
        formType={formType}
        value={courseData.sections}
        onChange={(v) => updateCourseData('sections', v)}
        errors={errors.sections}
      />

      {/* 강사소개 섹션 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-6">
          <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
            강사 소개
          </label>
          <div className="flex-1 flex flex-col gap-6">
            <ExpandableCards
              items={courseData.instructors.map((instructor, i) => ({
                id: i.toString(),
                title: instructor.name || `강사 ${i + 1}`,
                content: (
                  <InstructorSection
                    value={instructor}
                    onChange={(updatedInstructor) => {
                      const newInstructors = [...courseData.instructors];
                      newInstructors[i] = updatedInstructor;
                      updateCourseData('instructors', newInstructors);
                    }}
                    error={errors.instructors?.[i]}
                  />
                )
              }))}
              expandLabel="수정"
              collapseLabel="닫기"
              className="max-w-none mx-0"
              onDelete={
                courseData.instructors.length > 1
                  ? (id) => handleDeleteInstructor(parseInt(id))
                  : undefined
              }
            />
            <div className="flex justify-end">
              <AddButton label="강사 추가" onClick={handleAddInstructor} />
            </div>
          </div>
        </div>
      </div>

      {/* 추천 컨텐츠 링크 (강의 전용) */}
      {isCourse && (
        <RecommendedLinkSection
          value={courseData.links}
          onChange={(v) => updateCourseData('links', v)}
          error={errors.links}
        />
      )}

      {/* 버튼 */}
      <CourseActionButtons submitLabel={isEdit ? '수정' : '등록'} />
    </form>
  );
}
