'use client';
import { Button } from '../ui/button';
import { useState } from 'react';
import ReviewCard from './review-card';
import { Star } from 'lucide-react';

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
      <div className={`flex items-end gap-4 mb-8 ${headerClassName ?? ''}`}>
        <h2 className="text-3xl font-heading font-bold text-[#00263b] shrink-0">
          {title}
        </h2>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold text-[#00263b]">{rating} / 5</span>
          <div className="flex items-center text-[#ff4f02]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < rating ? 'fill-current' : 'fill-transparent'
                }`}
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
