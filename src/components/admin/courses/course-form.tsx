'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import SectionList from '@/components/admin/courses/sections/section-list';
import RecommendedSelect from '@/components/admin/courses/sections/recommended-select';
import InstructorSection from '@/components/admin/courses/sections/instructor-section';
import AddButton from '@/components/ui/admin/add-button';
import RecommendedLinkSection from '@/components/admin/courses/sections/recommended-link-section';
import CourseBasicSection from '@/components/admin/courses/sections/course-basic-section';
import CourseDetailSection from '@/components/admin/courses/sections/course-detail-section';
import CourseVisualSection from '@/components/admin/courses/sections/course-visual-section';
import CourseActionButtons from '@/components/admin/courses/sections/course-action-buttons';

type CourseData = {
  category: string;
  isPublic: string;
  showOnMain: boolean;
  title: string;
  intro: string;
  videoLink: string;
  price: string;
  time: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  visualTitle: string;
  visualTitle2: string;
  recommended: string[];
  instructors: number[];
  links: {
    url: string;
    name: string;
    errors?: { url?: string; name?: string };
  }[];
};

export default function CourseForm() {
  const [courseData, setCourseData] = useState<CourseData>({
    category: '',
    isPublic: '',
    showOnMain: false,
    title: '',
    intro: '',
    videoLink: '',
    price: '',
    time: '',
    thumbnail: null,
    thumbnailUrl: '',
    visualTitle: '',
    visualTitle2: '',
    recommended: [],
    instructors: [0],
    links: [{ url: '', name: '', errors: {} }]
  });

  const updateCourseData = <K extends keyof CourseData>(
    key: K,
    value: CourseData[K]
  ) => {
    setCourseData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddInstructor = () => {
    updateCourseData('instructors', [
      ...courseData.instructors,
      courseData.instructors.length
    ]);
  };

  const handleSubmit = () => {
    if (!courseData.title.trim() || !courseData.intro.trim()) {
      toast.error('필수 입력 항목을 모두 채워주세요.');
      return;
    }
    toast.success('등록 완료!');
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-8 pt-10 pb-16">
      {/* 카테고리 / 공개여부 / 메인표시 */}
      <CourseBasicSection
        category={courseData.category}
        setCategory={(v) => updateCourseData('category', v)}
        isPublic={courseData.isPublic}
        setIsPublic={(v) => updateCourseData('isPublic', v)}
        showOnMain={courseData.showOnMain}
        setShowOnMain={(v) => updateCourseData('showOnMain', v)}
      />

      {/* 강의 정보 */}
      <CourseDetailSection
        title={courseData.title}
        setTitle={(v) => updateCourseData('title', v)}
        intro={courseData.intro}
        setIntro={(v) => updateCourseData('intro', v)}
        videoLink={courseData.videoLink}
        setVideoLink={(v) => updateCourseData('videoLink', v)}
        price={courseData.price}
        setPrice={(v) => updateCourseData('price', v)}
        time={courseData.time}
        setTime={(v) => updateCourseData('time', v)}
        thumbnail={courseData.thumbnail}
        setThumbnail={(v) => updateCourseData('thumbnail', v)}
        thumbnailUrl={courseData.thumbnailUrl}
        setThumbnailUrl={(v) => updateCourseData('thumbnailUrl', v)}
      />

      {/* 비주얼 타이틀 */}
      <CourseVisualSection
        visualTitle={courseData.visualTitle}
        setVisualTitle={(v) => updateCourseData('visualTitle', v)}
        visualTitle2={courseData.visualTitle2}
        setVisualTitle2={(v) => updateCourseData('visualTitle2', v)}
      />

      {/* 추천드려요 */}
      <RecommendedSelect
        maxSelect={2}
        onChange={(v) => updateCourseData('recommended', v)}
      />

      {/* 섹션 리스트 */}
      <SectionList />

      {/* 강사소개 섹션 */}
      <div className="flex flex-col gap-6">
        {courseData.instructors.map((_, i) => (
          <InstructorSection key={i} />
        ))}
        <div className="flex justify-end">
          <AddButton label="강사 추가" onClick={handleAddInstructor} />
        </div>
      </div>

      {/* 추천 컨텐츠 링크 */}
      <RecommendedLinkSection onChange={(v) => updateCourseData('links', v)} />

      {/* 버튼 */}
      <CourseActionButtons onSubmit={handleSubmit} />
    </div>
  );
}
