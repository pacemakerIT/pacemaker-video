'use client';
import { Button } from '../ui/button';
import { useState } from 'react';
import SectionHeader from './section-header';
import ReviewCard from './review-card';
import Image from 'next/image';

interface Review {
  id: string | number;
  profileImage: string;
  profileName: string;
  rating: number;
  reviewDate: string;
  reviewContent: string;
}

interface DetailReviewsSectionProps {
  title?: string;
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
  initialVisibleCount?: number;
  loadMoreCount?: number;
  loadMoreButtonText?: string;
}

export default function DetailReviewsSection({
  title = '강의 후기',
  reviews = [],
  rating = 5,
  reviewCount = 0,
  initialVisibleCount = 5,
  loadMoreCount = 5,
  loadMoreButtonText = '리뷰 더보기'
}: DetailReviewsSectionProps) {
  const [visibleReviews, setVisibleReviews] = useState(initialVisibleCount);

  const handleLoadMoreReviews = () => {
    setVisibleReviews((prev) => Math.min(prev + loadMoreCount, reviews.length));
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex justify-start items-center">
        <SectionHeader title={title} className={'!w-fit'} />
        <div className="flex items-center justify-start gap-2 ml-4">
          <span className="text-xl font-medium">{rating} / 5</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: rating }).map((_, i) => (
              <Image
                key={i}
                src="/icons/full-star.svg"
                width={24}
                height={24}
                alt="Full star"
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm">({reviewCount}개 후기)</span>
        </div>
      </div>

      {/* 후기 카드들 */}
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-4">
          {reviews.slice(0, visibleReviews).map((review) => (
            <ReviewCard
              key={review.id}
              profileImage={review.profileImage}
              profileName={review.profileName}
              rating={review.rating}
              reviewDate={review.reviewDate}
              reviewContent={review.reviewContent}
            />
          ))}
        </div>

        {/* 리뷰 더보기 버튼 */}
        {visibleReviews < reviews.length && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleLoadMoreReviews}
              variant="outline"
              className="px-4 py-[13px] rounded-full bg-pace-orange-500 border-pace-orange-500 text-white"
            >
              {loadMoreButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
