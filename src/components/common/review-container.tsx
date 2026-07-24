'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
}

const ReviewContainer = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        setReviews(data);
      } catch {
        // 에러 무시
      }
    };
    fetchReviews();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F2F4F7] py-16 md:py-24 flex flex-col items-center font-body">
      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="text-[24px] font-bold text-[#00263B]">
            Hear from learners who&apos;ve taken our courses.
          </h2>
        </div>
      </div>

      <div className="w-full overflow-hidden px-4">
        <div
          className={`flex gap-6 w-max${reviews.length > 0 ? ' animate-marquee' : ''}`}
          style={
            reviews.length > 0
              ? // Match the sample's marquee speed (~12px/s) regardless of review count:
                // one loop scrolls reviews.length cards of ~324px each.
                { animationDuration: `${reviews.length * 27}s` }
              : undefined
          }
        >
          {[...Array(3)].map((_, idx) =>
            reviews.map((review) => (
              <div
                key={review.id + '-' + idx}
                className="inline-block bg-white rounded-none border border-gray-100 shadow-[0_10px_30px_rgba(0,38,59,0.08)] p-8 w-[300px] flex-shrink-0"
              >
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-[0.85rem] text-[#00263B]">
                    {review.author}
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Image
                        key={i}
                        src="/img/rating.png"
                        alt="star"
                        width={14}
                        height={14}
                        className="inline-block mr-1"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[1rem] text-[#475467] break-words whitespace-pre-line leading-relaxed mb-2 line-clamp-4">
                  {review.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default ReviewContainer;
