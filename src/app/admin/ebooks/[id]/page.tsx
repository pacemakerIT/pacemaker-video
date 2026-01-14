'use client';

import EbookForm, { EbookData } from '@/components/admin/ebooks/ebook-form';

// Mock Data
const MOCK_EBOOK_DATA: EbookData = {
  category: '네트워킹',
  isPublic: '공개',
  showOnMain: true,
  title: '자기소개서 작성 및 면접 준비까지 하나로!',
  intro: '실제 캐나다 기업 합격 이력서를 바탕으로...',
  processTitle: '북미 개발자 이력서의 핵심',
  processContent: '목차 및 요약 내용입니다...',
  price: '999',
  thumbnail: null,
  thumbnailUrl: '/img/course_image1.png',
  file: null,
  fileUrl: 'guide_v1.pdf',
  visualTitle: '캐나다 테크기업 OOO이 선택한',
  visualTitle2: '북미 취업의 정석 PDF',
  recommended: ['IT 개발', '북미 취업이력서'],
  sections: [
    {
      title: '북미 개발자 채용 공고 사례',
      content: '이번 영상에서는...',
      videos: []
    }
  ],
  links: [{ url: 'https://example.com', name: '참고 링크', errors: {} }]
};

export default function EbookEditPage() {
  // In real app, fetch(id)
  const ebookData = MOCK_EBOOK_DATA;

  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">전자책 관리</h1>
        <button className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded">
          저장
        </button>
      </div>
      <div>
        <div className="border-b border-pace-gray-700 pb-5">
          <span className="text-pace-xl font-bold leading-[52px]">
            전자책 수정
          </span>
        </div>

        <EbookForm initialData={ebookData} />
      </div>
    </div>
  );
}
