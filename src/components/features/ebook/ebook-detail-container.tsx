'use client';
import SectionHeader from '../../common/section-header';
import ExpandableCards from '../../common/expandable-cards';
import DetailHeroSection from '../../common/detail-hero-section';
import DetailReviewsSection from '../../common/detail-reviews-section';
import DetailRelatedContentSection from '../../common/detail-related-content-section';
import DetailRecommendationSection from '../../common/detail-recommendation-section';
import { ItemType, TargetAudienceType } from '@prisma/client';
import { RECOMMENDATION_BANNERS } from '@/constants/recommendations';

export interface TOCItem {
  id: string;
  title: string;
  content: string;
}

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
  targetAudienceTypes?: TargetAudienceType[];
  tableOfContents?: TOCItem[];
}

export default function EbookDetailContainer({
  backgroundImage = '/img/ebook-bg.png',
  subtitle = 'Chosen by Canadian tech companies',
  title = 'Resume strategies\nthat help developers stand out.',
  courseTitle = 'Developer Job Applications & Networking',
  instructor = 'James',
  description = 'Learn how recruiters evaluate developer resumes, based on real hiring examples from Canadian tech companies.',
  price = '999.99',
  reviewCount = 185,
  rating = 5,
  targetAudienceTypes = [TargetAudienceType.IT, TargetAudienceType.RESUME],
  tableOfContents
}: EbookDetailContainerProps) {
  const reviews = [
    {
      id: 1,
      profileImage: '/img/instructor-image.png',
      profileName: 'Jay',
      rating: 5,
      reviewDate: '2024.01.15',
      reviewContent:
        'They helped me establish my motivating factors, transferable skills, and areas of expertise that would allow me to best navigate the highly competitive job market. Thanks to their support, more and more one-on-one sessions, I have found a position that fits my goals and professional abilities.'
    }
  ];

  const recommendationItems = targetAudienceTypes.map(
    (type) => RECOMMENDATION_BANNERS[type]
  );

  const cards = [
    {
      id: '1',
      itemId: 'course-1',
      title: 'React 기초부터 실전까지',
      price: 299,
      category: 'Marketing',
      type: 'course',
      thumbnail: null
    }
  ];

  return (
    <div className="w-full flex flex-col justify-between items-center gap-20">
      <DetailHeroSection
        backgroundImage={backgroundImage}
        subtitle="E-book Presentation"
        title="Effective Resume Structure & Keywords"
        courseTitle={title.replace('\n', ' ')}
        instructor={instructor}
        description={description}
        price={price}
        buttonText="Add to cart"
        instructorLabel="Instructor"
        priceLabel="Price"
        itemType={ItemType.DOCUMENT}
      />
      <div className="w-full flex flex-col justify-between items-center max-w-[1200px] gap-20  pb-40">
        <div className="flex flex-col gap-8">
          <SectionHeader
            subtitle="Chosen by Leading Canadian Tech Companies"
            title="Effective Resume Structure & Keywords for Developers"
          />
          <div className="w-full flex gap-8">
            <div className="w-[60%]">
              <p className="text-pace-stone-500 leading-relaxed">
                To land a developer role in North America, strong coding skills
                aren’t enough. Understanding job postings and what companies are
                truly looking for is just as important.
              </p>
            </div>
            <div className="w-[40%]">
              <ExpandableCards
                items={
                  tableOfContents && Array.isArray(tableOfContents)
                    ? tableOfContents
                    : []
                }
              />
            </div>
          </div>
        </div>

        <DetailRecommendationSection
          title="Recommended For"
          items={recommendationItems}
        />
        <DetailRelatedContentSection
          title="Recommended E-books"
          items={cards}
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
