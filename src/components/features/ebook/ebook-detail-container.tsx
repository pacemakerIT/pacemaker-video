'use client';
import SectionHeader from '../../common/section-header';
import ExpandableCards from '../../common/expandable-cards';
import DetailHeroSection from '../../common/detail-hero-section';
import DetailReviewsSection from '../../common/detail-reviews-section';
import DetailRelatedContentSection from '../../common/detail-related-content-section';
import DetailRecommendationSection from '../../common/detail-recommendation-section';
import { ItemType, TargetAudienceType } from '@prisma/client';
import { CodeSquare, FileEdit } from 'lucide-react';
import { RelatedContentItem } from '@/types/video-detail';

export interface TOCItem {
  id: string;
  title: string;
  content: string;
}

interface EbookDetailContainerProps {
  backgroundImage?: string;
  subtitle?: string;
  sectionTitle?: string;
  visualTitle?: string;
  visualTitle2?: string;
  subDescription?: string;
  title?: string;
  courseTitle?: string;
  instructor?: string;
  description?: string;
  price?: string;
  reviewCount?: number;
  rating?: number;
  targetAudienceTypes?: TargetAudienceType[];
  tableOfContents?: TOCItem[];
  relatedItems?: RelatedContentItem[];
}

export default function EbookDetailContainer({
  backgroundImage = '/img/ebook-bg.png',
  subtitle = 'Chosen by Canadian tech companies',
  sectionTitle,
  visualTitle,
  visualTitle2,
  subDescription,
  title = 'Resume strategies\nthat help developers stand out.',
  courseTitle = 'Developer Job Applications & Networking',
  instructor = 'James',
  description = 'Learn how recruiters evaluate developer resumes, based on real hiring examples from Canadian tech companies.',
  price = '999.99',
  reviewCount = 185,
  rating = 5,
  tableOfContents,
  relatedItems = []
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
        'They helped me establish my motivating factors, transferable skills, and areas of expertise that would allow me to best navigate the highly competitive job market. Thanks to their support, more and more one-on-one sessions, I have found a position that fits my goals and professional abilities.'
    },
    {
      id: 2,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.12',
      reviewContent:
        'They helped me establish my motivating factors, transferable skills, and areas of expertise that would allow me to best navigate the highly competitive job market. Thanks to their support, more and more one-on-one sessions, I have found a position that fits my goals and professional abilities.'
    },
    {
      id: 3,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.10',
      reviewContent:
        'They helped me establish my motivating factors, transferable skills, and areas of expertise that would allow me to best navigate the highly competitive job market. Thanks to their support, more and more one-on-one sessions, I have found a position that fits my goals and professional abilities.'
    },
    {
      id: 4,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.08',
      reviewContent:
        'They helped me establish my motivating factors, transferable skills, and areas of expertise that would allow me to best navigate the highly competitive job market. Thanks to their support, more and more one-on-one sessions, I have found a position that fits my goals and professional abilities.'
    },
    {
      id: 5,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.05',
      reviewContent:
        'They helped me establish my motivating factors, transferable skills, and areas of expertise that would allow me to best navigate the highly competitive job market. Thanks to their support, more and more one-on-one sessions, I have found a position that fits my goals and professional abilities.'
    }
  ];

  const recommendationItems = [
    {
      icon: CodeSquare,
      label: 'IT Specialist',
      text: 'For those interested in North American tech careers'
    },
    {
      icon: FileEdit,
      label: 'Resume Prep',
      text: 'For those who need help with North American resumes'
    }
  ];

  return (
    <div className="w-full flex flex-col justify-between items-center gap-20">
      <DetailHeroSection
        backgroundImage={backgroundImage}
        visualTitle={visualTitle}
        visualTitle2={visualTitle2}
        title={courseTitle || title.replace('\n', ' ')}
        instructor={instructor}
        description={description}
        price={price}
        buttonText="Add to cart"
        instructorLabel="Instructor"
        priceLabel="Price"
        itemType={ItemType.EBOOK}
      />
      <div className="w-full flex flex-col justify-between items-center max-w-[1200px] gap-20  pb-40">
        <div className="w-full flex flex-col gap-8">
          <SectionHeader
            subtitle={subtitle || 'Chosen by Leading Canadian Tech Companies'}
            title={sectionTitle ?? title ?? ''}
          />
          <div className="w-full flex gap-8">
            <div className="w-[60%]">
              <p className="text-pace-stone-500 leading-relaxed">
                {subDescription}
              </p>
            </div>
            <ExpandableCards
              items={
                tableOfContents && Array.isArray(tableOfContents)
                  ? tableOfContents
                  : []
              }
            />
          </div>
        </div>

        <DetailRecommendationSection
          title="Recommended For"
          items={recommendationItems}
        />
        <DetailRelatedContentSection
          title="Recommended E-books"
          items={relatedItems}
        />
        <DetailReviewsSection
          title="Reader Reviews"
          reviews={reviews}
          rating={rating}
          reviewCount={reviewCount}
        />
      </div>
    </div>
  );
}
