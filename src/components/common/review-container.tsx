'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

// 리뷰 데이터 타입 정의
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
    <section className="relative w-screen overflow-hidden bg-gray-soft py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-12 max-w-[800px] text-center md:mb-16">
          <h2 className="font-headline text-[24px] font-bold text-navy md:text-[28px]">
            Hear from learners who&apos;ve taken our courses.
          </h2>
        </div>
      </div>

      <div className="w-full overflow-hidden px-4">
        <div
          className={`flex whitespace-nowrap${reviews.length > 0 ? ' animate-marquee' : ''} p-4`}
        >
          {[...Array(3)].map((_, idx) =>
            reviews.map((review) => (
              <div
                key={review.id + '-' + idx}
                className="mx-3 md:mx-4 inline-block w-[300px] md:w-[340px] shrink-0 rounded-none border border-gray-100 bg-white p-6 md:p-8 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="mb-2 font-headline text-sm font-bold text-navy md:text-base">
                    {review.author}
                  </div>
                  <div className="mb-1 flex items-center shrink-0">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Image
                        key={i}
                        src="/img/rating.png"
                        alt="star"
                        width={14}
                        height={14}
                        className="mr-1 inline-block"
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-2 line-clamp-4 max-w-full break-words whitespace-pre-line font-body text-xs md:text-sm leading-relaxed text-body-text">
                  {review.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* marquee 애니메이션용 스타일 */}
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
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default ReviewContainer;
