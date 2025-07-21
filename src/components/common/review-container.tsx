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
    <div className="w-screen relative h-[360px] overflow-hidden bg-pace-ivory-500 flex items-center">
      <div
        className={`whitespace-nowrap flex${reviews.length > 0 ? ' animate-marquee' : ''}`}
      >
        {[...Array(3)].map((_, idx) =>
          reviews.map((review) => (
            <div
              key={review.id + '-' + idx}
              className="inline-block bg-white rounded-lg shadow p-4 mx-4 w-[300px] min-[151px]"
            >
              <div className="font-bold mb-2">{review.author}</div>
              <div className="flex items-center mb-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Image
                    key={i}
                    src="/img/rating.png"
                    alt="star"
                    width={20}
                    height={20}
                    className="inline-block mr-1"
                  />
                ))}
              </div>
              <div className="text-sm break-words whitespace-pre-line mb-2 max-w-64 line-clamp-6">
                {review.content}
              </div>
              {/* <div className="text-xs text-gray-400">{review.date}</div> */}
            </div>
          ))
        )}
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
          animation: marquee 300s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ReviewContainer;
