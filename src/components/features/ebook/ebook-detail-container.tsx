'use client';
import { FileEdit, CodeSquare } from 'lucide-react';
import SectionHeader from '../../common/section-header';
import ExpandableCards from '../../common/expandable-cards';
import DetailHeroSection from '../../common/detail-hero-section';
import DetailReviewsSection from '../../common/detail-reviews-section';
import DetailRelatedContentSection from '../../common/detail-related-content-section';
import DetailRecommendationSection from '../../common/detail-recommendation-section';

interface EbookDetailContainerProps {
  backgroundImage?: string;
  subtitle?: string;
  title?: string;
  courseTitle?: string;
  instructor?: string;
  description?: string;
  price?: string;
  reviewCount?: number;
  rating?: number;
}

export default function EbookDetailContainer({
  backgroundImage = '/img/video-bg.png',
  subtitle = '캐나다 테크기업 OOO이 선택한',
  title = '북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지',
  courseTitle = '자기소개서 작성 및 면접 준비까지 하나로!',
  instructor = 'Heilee, Linda, Raphael. Lee',
  description = '실제 캐나다 기업 합격 이력서를 바탕으로, 북미 인사 담당자들이 개발자 이력서에서 주목하는 구조와 표현을 분석해보세요!',
  price = '$999.99',
  reviewCount = 185,
  rating = 5
}: EbookDetailContainerProps) {
  // 후기 데이터 (실제로는 API에서 가져올 데이터)
  const reviews = [
    {
      id: 1,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.15',
      reviewContent:
        '정말 유익한 강의였습니다. 실무에서 바로 적용할 수 있는 내용들이 많아서 도움이 많이 되었어요. 강사님의 설명도 매우 명확하고 이해하기 쉬웠습니다.'
    },
    {
      id: 2,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.12',
      reviewContent:
        '처음 배우는 분들에게도 추천하고 싶은 강의입니다. 기초부터 차근차근 설명해주셔서 따라하기 쉬웠어요.'
    },
    {
      id: 3,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 4,
      reviewDate: '2024.01.10',
      reviewContent:
        '프로젝트 실습 부분이 특히 좋았습니다. 이론만 배우는 게 아니라 실제로 만들어보면서 학습할 수 있어서 좋았어요.'
    },
    {
      id: 4,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.08',
      reviewContent:
        '강의 자료가 정말 잘 정리되어 있어서 나중에 다시 보기에도 좋습니다. 강사님의 실무 경험이 잘 녹아들어 있어서 현실적인 조언도 많이 얻을 수 있었어요.'
    },
    {
      id: 5,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.05',
      reviewContent:
        '가격 대비 정말 퀄리티가 높은 강의라고 생각합니다. 다른 강의들도 들어보고 싶어졌어요.'
    },
    {
      id: 6,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 4,
      reviewDate: '2024.01.03',
      reviewContent:
        'UI/UX 관점에서도 잘 설명해주셔서 개발자뿐만 아니라 디자이너에게도 도움이 될 것 같아요.'
    },
    {
      id: 7,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.01',
      reviewContent:
        '데이터베이스 설계 부분이 특히 인상적이었습니다. 실무에서 바로 적용할 수 있는 패턴들을 많이 배웠어요.'
    },
    {
      id: 8,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 4,
      reviewDate: '2023.12.28',
      reviewContent:
        '테스트 코드 작성 방법도 함께 알려주셔서 좋았습니다. 코드 품질을 높이는 방법을 배울 수 있었어요.'
    }
  ];

  // 추천 대상 데이터
  const recommendationItems = [
    {
      icon: CodeSquare,
      label: '북미 개발자',
      text: '개발 분야 취업에 관심 있으신 분'
    },
    {
      icon: FileEdit,
      label: '북미 취업이력서',
      text: '작성방법이 궁금하신 분'
    }
  ];

  // 카드 데이터 정의
  const cards = [
    {
      id: 1,
      itemId: 'course-1',
      title: 'React 기초부터 실전까지',
      price: 299,
      category: 'Marketing'
    },
    {
      id: 2,
      itemId: 'course-2',
      title: 'Node.js 백엔드 개발',
      price: 399,
      category: 'Design'
    },
    {
      id: 3,
      itemId: 'ebook-1',
      title: 'JavaScript 완벽 가이드',
      price: 199,
      category: 'IT'
    }
  ];

  return (
    <div className="w-full flex flex-col justify-between items-center gap-20">
      <DetailHeroSection
        backgroundImage={backgroundImage}
        subtitle={subtitle}
        title={title}
        courseTitle={courseTitle}
        instructor={instructor}
        description={description}
        price={price}
        buttonText="장바구니 담기"
        instructorLabel="강사"
        priceLabel="금액"
      />
      <div className="w-full flex flex-col justify-between items-center max-w-[1200px] gap-20  pb-40">
        <div className="flex flex-col gap-8">
          <SectionHeader
            subtitle="OOO가 선택한 이력서!"
            title="북미 개발자 이력서의  효과적인 구성과 키워드"
          />
          <div className="w-full flex gap-8">
            <div className="w-[60%]">
              <p className="text-pace-stone-500 leading-relaxed">
                북미에서 개발자로 취업하려면 코딩 실력만큼이나 채용공고를 제대로
                읽고 이해하는 능력이 중요해요. 특히 요즘은 AI 덕분에 개발
                생산성이 높아지면서, 지난 5년간 북미 지역의 개발자 채용공고 수가
                약 35%나 줄었어요. 그만큼 기업들은 더 신중하게, 해당 포지션을
                정말 잘 이해하고 있는 지원자를 찾고 있죠. 한국과는 조금 다른
                북미식 채용공고의 특징, 어떻게 읽고 준비해야 할지 막막하셨다면,
                실제 캐나다 기업에 최종 합격한 페이스메이커 개발자의 영문
                이력서를 통해 채용공고 분석부터 이력서에 반영하는 방법까지 함께
                살펴보세요!
              </p>
            </div>
            <div className="w-[40%]">
              <ExpandableCards
                items={[
                  {
                    id: '1',
                    title: '북미 개발자 채용 공고 사례',
                    content:
                      '한국과는 다른 스타일의 실제 북미 채용공고 사례를 통해, 최신 채용트렌드를 확인해봅니다.'
                  },
                  {
                    id: '2',
                    title: '북미 개발자 채용 공고 분석',
                    content:
                      '실제 북미 지역의 채용공고를 기반으로, 해당 포지션에 적합한 이력서 전략과 핵심 키워드를 어떻게 효과적으로 반영할 수 있을지 분석합니다.'
                  },
                  {
                    id: '3',
                    title: '실제 북미 개발자 취업 성공 이력서',
                    content:
                      '실제 북미 지역에서 최종 합격한 이력서를 보며, 채용 공고 분석 및 활용 방법을 알아봅니다.'
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <DetailRecommendationSection
          title="이런분들께 추천드려요!"
          items={recommendationItems}
        />
        <DetailRelatedContentSection
          title="이 컨텐츠와 함께 보면 좋아요!"
          items={cards}
        />
        <DetailReviewsSection
          title="전자책 후기"
          reviews={reviews}
          rating={rating}
          reviewCount={reviewCount}
        />
      </div>
    </div>
  );
}
