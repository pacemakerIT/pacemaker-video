'use client';
import { Button } from '../ui/button';
import { useState } from 'react';
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
  headerClassName?: string;
  cardClassName?: string;
}

export default function DetailReviewsSection({
  title = 'Student Reviews',
  reviews = [],
  rating = 5,
  reviewCount = 0,
  initialVisibleCount = 5,
  loadMoreCount = 5,
  loadMoreButtonText = 'View more reviews',
  headerClassName,
  cardClassName
}: DetailReviewsSectionProps) {
  const [visibleReviews, setVisibleReviews] = useState(initialVisibleCount);

  const handleLoadMoreReviews = () => {
    setVisibleReviews((prev) => Math.min(prev + loadMoreCount, reviews.length));
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className={`flex items-end gap-4 mb-2 ${headerClassName ?? ''}`}>
        <h2 className="text-3xl font-bold text-pace-black-500 shrink-0">
          {title}
        </h2>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold">{rating} / 5</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Image
                key={i}
                src={
                  i < rating ? '/icons/full-star.svg' : '/icons/empty-star.svg'
                }
                width={16}
                height={16}
                alt={i < rating ? 'Full star' : 'Empty star'}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm whitespace-nowrap">
            ({reviewCount} reviews)
          </span>
        </div>
      </div>

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
              className={cardClassName}
            />
          ))}
        </div>

        {visibleReviews < reviews.length && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleLoadMoreReviews}
              className="bg-[#ff4f02] hover:bg-[#e04500] text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02]"
            >
              {loadMoreButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
