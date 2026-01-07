'use client';

import CourseForm, { CourseData } from '@/components/admin/courses/course-form';

// Mock Data for testing edit mode
const MOCK_COURSE_DATA: CourseData = {
  category: '네트워킹',
  isPublic: '공개',
  showOnMain: true,
  title: '자기소개서 작성 및 면접 준비까지 하나로!',
  intro:
    '실제 캐나다 기업 합격 이력서를 바탕으로, 북미 인사 담당자들이 개발자 이력서에서 주목하는 구조와 표현을 분석해보세요!',
  processTitle: '북미 개발자 차별화된 이력서부터 인터뷰까지 차근차근 준비하기',
  processContent:
    '북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로 읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발 생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가 약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을 정말 잘 이해하고 있는 지원자를 찾고 있죠.\n\n한국과는 조금 다른 북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면, 실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문 이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께 살펴보세요!',
  videoLink: 'https://www.youtube.com/watch?v=example',
  price: '999',
  time: '03:15',
  thumbnail: null,
  thumbnailUrl: '/img/ebook_image1.png',
  visualTitle: '캐나다 테크기업 OOO이 선택한',
  visualTitle2:
    '북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지',
  recommended: ['IT 개발', '북미 취업이력서'],
  sections: [
    {
      title: '북미 개발자 채용 공고 사례',
      content:
        '이번 영상에서는 Genius Zone과 Story Building을 통해 자신의 잠재력을 발견하고, 이를 커리어에 효과적으로 연결하는 방법을 소개합니다. 또한 북미 이력서 가이드라인과 잡 디스크립션 분석법을 통해, 북미 취업 시장에 적합한 이력서를 전략적으로 준비하는 방법도 함께 다룹니다.',
      videos: [
        {
          title: '입력된 동영상 제목 입니다.',
          link: 'https://youtu.be/example1'
        }
      ]
    },
    {
      title: '북미 이력서 필수 스킬 셋',
      content:
        '북미 지역 잡 디스크립션에서 자주 등장하는 핵심 스킬셋을 살펴보고, 이를 어떤 방식과 표현으로 이력서에 효과적으로 반영할 수 있는지 알아봅니다.',
      videos: [
        {
          title: '입력된 동영상 제목 입니다.',
          link: 'https://youtu.be/example2'
        },
        {
          title: '입력된 동영상 제목 입니다.',
          link: 'https://youtu.be/example3'
        }
      ]
    },
    {
      title: '북미 이력서 필수 스킬 셋',
      content:
        '북미 지역 잡 디스크립션에서 자주 등장하는 핵심 스킬셋을 살펴보고, 이를 어떤 방식과 표현으로 이력서에 효과적으로 반영할 수 있는지 알아봅니다.',
      videos: [
        {
          title: '입력된 동영상 제목 입니다.',
          link: 'https://youtu.be/example4'
        }
      ]
    }
  ],
  instructors: [
    {
      name: 'Raphael. Lee',
      intro:
        "I've bee managing multicultural teams for ever 19 years. And blesses to lead and be part of the opening teams in global projects in various countries. Growing personal & professional goals by sharing visions with teammates became a part of my passion and a long-term goal in my life.",
      careers: [
        {
          startDate: '2019',
          endDate: '',
          isCurrent: true,
          description: 'Managing Director at Pacemaker'
        }
      ],
      photo: null,
      photoUrl: '/img/user1.png'
    }
  ],
  links: [{ url: 'https://example.com', name: '연결된 링크명', errors: {} }]
};

export default function CourseEditPage() {
  // In a real app, you would fetch data here based on `id`
  // const { data, isLoading } = useQuery(['course', id], () => fetchCourse(id));
  const courseData = MOCK_COURSE_DATA;

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">온라인 강의 관리</h1>
        {/* TODO: DB 완료 후 수정 저장 기능 추가 */}
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>
      <div>
        {/* 온라인 강의 리스트 */}
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            온라인 강의 수정
          </span>
        </div>

        <CourseForm initialData={courseData} />
      </div>
    </div>
  );
}
