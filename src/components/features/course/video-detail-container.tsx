'use client';
import { FileEdit, CodeSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import SectionHeader from '../../common/section-header';
import ExpandableCards from '../../common/expandable-cards';
import DetailHeroSection from '../../common/detail-hero-section';
import DetailReviewsSection from '../../common/detail-reviews-section';
import DetailRelatedContentSection from '../../common/detail-related-content-section';
import DetailRecommendationSection from '../../common/detail-recommendation-section';
import Image from 'next/image';
import { ApiResponse } from '@/types/video-detail';

interface VideoDetailContainerProps {
  videoId: string;
}

export default function VideoDetailContainer({
  videoId
}: VideoDetailContainerProps) {
  const [data, setData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/videos/detail/${videoId}`);
        const result: ApiResponse = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetail();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-pace-stone-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">오류: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-pace-stone-500">데이터를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // 섹션별로 데이터 분리
  const contentSection = data.course.sections.find(
    (section) => section.type === 'content'
  );
  const recommendationSection = data.course.sections.find(
    (section) => section.type === 'recommendation'
  );
  const relatedSection = data.course.sections.find(
    (section) => section.type === 'related'
  );

  // 아이콘 매핑
  const iconMap = {
    CodeSquare,
    FileEdit
  };

  // 추천 아이템에 아이콘 컴포넌트 추가
  const recommendationItems =
    recommendationSection?.items.map((item) => ({
      ...item,
      icon: iconMap[item.icon as keyof typeof iconMap] || CodeSquare,
      text: item.content || ''
    })) || [];

  return (
    <div className="w-full flex flex-col justify-between items-center gap-20">
      <DetailHeroSection
        backgroundImage={data.course.backgroundImage}
        subtitle={data.course.subtitle}
        title={data.course.title}
        courseTitle={data.course.courseTitle}
        instructor={data.instructor?.name || 'Unknown'}
        description={data.course.description}
        price={data.course.price}
        buttonText="장바구니 담기"
        instructorLabel="강사"
        priceLabel="금액"
      />
      <div className="w-full flex flex-col justify-between items-center max-w-[1200px] gap-20 pb-40">
        {contentSection && (
          <div className="flex flex-col gap-8 w-full">
            <SectionHeader
              subtitle={contentSection.title}
              title={contentSection.subtitle || ''}
            />
            <div className="w-full flex gap-8">
              <div className="w-[60%]">
                <p className="text-pace-stone-500 leading-relaxed">
                  {contentSection.description}
                </p>
              </div>
              <div className="w-[40%]">
                <ExpandableCards
                  items={contentSection.items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    content: item.content
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        {recommendationSection && (
          <DetailRecommendationSection
            title={recommendationSection.title}
            items={recommendationItems}
          />
        )}

        {data.instructor && (
          <div className="flex flex-col w-full gap-8">
            <SectionHeader title="강사 소개" />
            <div className="w-full flex gap-10">
              <div className="w-[70%]">
                <h3>{data.instructor.name}</h3>
                <p className="text-pace-stone-500 leading-relaxed">
                  {data.instructor.description}
                </p>
                <div className="mt-6">
                  <h4 className="text-pace-base font-regular mb-4">이력</h4>
                  <table className="w-full">
                    <tbody className="text-pace-stone-500">
                      {data.instructor.careers.map((careerItem, index) => (
                        <tr key={index}>
                          <td className="py-1 pr-4">{careerItem.period}</td>
                          <td className="py-1">{careerItem.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-[30%]">
                <Image
                  src={data.instructor.profileImage}
                  alt="instructor"
                  width={360}
                  height={360}
                />
              </div>
            </div>
          </div>
        )}

        {relatedSection && (
          <DetailRelatedContentSection
            title={relatedSection.title}
            items={relatedSection.items.map((item) => ({
              id: parseInt(item.id.replace('related-item-', '')),
              itemId: item.itemId || '',
              title: item.title,
              price: item.price || 0,
              category: item.category || '',
              type: item.type || '',
              thumbnail: item.thumbnail || ''
            }))}
          />
        )}

        <DetailReviewsSection
          title="강의 후기"
          reviews={data.course.reviews}
          rating={data.course.rating}
          reviewCount={data.course.reviewCount}
        />
      </div>
    </div>
  );
}
