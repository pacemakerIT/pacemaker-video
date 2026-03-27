'use client';

import AddForm, { CourseData } from '@/components/admin/add-form';

import { useEffect, useState, use } from 'react';
import { toast } from 'sonner';

export default function CourseEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/detail/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch course');
        }
        const json = await res.json();
        if (json.success) {
          const apiData = json.data.course;

          // Map DB structure to CourseData structure
          setCourseData({
            category: apiData.category || '',
            isPublic: apiData.isPublic ? '공개' : '비공개',
            showOnMain: apiData.showOnMain || false,
            title: apiData.title || '',
            intro: apiData.description || '',
            visualTitle: apiData.processTitle || '',
            visualTitle2: apiData.processContent || '',
            processTitle: apiData.visualTitle || '',
            processContent: apiData.visualTitle2 || '',
            videoLink: apiData.videoLink || '',
            price: apiData.price || '',
            time: apiData.time || '',
            thumbnail: null,
            thumbnailUrl: apiData.thumbnailUrl || '',
            recommended: [], // Map if available
            sections:
              apiData.sections.length > 0
                ? apiData.sections.map(
                    (sec: {
                      title: string;
                      description?: string;
                      videos?: { title: string; url: string }[];
                    }) => ({
                      title: sec.title,
                      content: sec.description || '',
                      videos: sec.videos
                        ? sec.videos.map(
                            (v: { title: string; url: string }) => ({
                              title: v.title,
                              link: v.url
                            })
                          )
                        : [{ title: '', link: '' }]
                    })
                  )
                : [
                    {
                      title: '',
                      content: '',
                      videos: [{ title: '', link: '' }]
                    }
                  ],
            instructors:
              apiData.instructors.length > 0
                ? apiData.instructors.map(
                    (inst: {
                      name: string;
                      description?: string;
                      careers?: string | unknown[];
                      profileImage?: string;
                    }) => ({
                      name: inst.name,
                      intro: inst.description || '',
                      careers: inst.careers
                        ? typeof inst.careers === 'string'
                          ? JSON.parse(inst.careers)
                          : inst.careers
                        : [
                            {
                              startDate: '',
                              endDate: '',
                              isCurrent: false,
                              description: ''
                            }
                          ],
                      photo: null,
                      photoUrl: inst.profileImage || ''
                    })
                  )
                : [
                    {
                      name: '',
                      intro: '',
                      careers: [
                        {
                          startDate: '',
                          endDate: '',
                          isCurrent: false,
                          description: ''
                        }
                      ],
                      photo: null,
                      photoUrl: ''
                    }
                  ],
            links: [{ url: '', name: '', errors: {} }] // Map if available
          });
        } else {
          toast.error(json.message || '강의를 불러오는데 실패했습니다.');
        }
      } catch {
        toast.error('강의 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id]);

  if (loading) {
    return <div className="p-10">강의 정보를 불러오는 중...</div>;
  }

  if (!courseData) {
    return <div className="p-10">강의 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">온라인 강의 관리</h1>
        {/* TODO: 임시저장 기능 구현필요 (PACE-231) */}
        {/* <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button> */}
      </div>
      <div>
        {/* 온라인 강의 리스트 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            온라인 강의 수정
          </span>
        </div>

        <AddForm
          formType="course"
          initialData={courseData}
          isEdit={true}
          courseId={id}
        />
      </div>
    </div>
  );
}
