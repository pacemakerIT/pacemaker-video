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
    <div className="w-screen relative flex-col justify-center gap-8 py-20 overflow-hidden bg-pace-ivory-500 flex items-center">
      <h3 className="text-center text-2xl font-medium">
        Explore Honest Reviews from Our Students
      </h3>
      <div
        className={`whitespace-nowrap flex${reviews.length > 0 ? ' animate-marquee' : ''} p-4`}
      >
        {[...Array(3)].map((_, idx) =>
          reviews.map((review) => (
            <div
              key={review.id + '-' + idx}
              className="inline-block bg-white rounded-lg shadow p-4 mx-4 w-[300px]"
            >
              <div className="flex justify-between">
                <div className="font-medium text-[10px] text-pace-orange-600 mb-2">
                  {review.author}
                </div>
                <div className="flex items-center mb-1">
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
              <div className="text-[10px] text-pace-stone-700 break-words whitespace-pre-line mb-2 max-w-64 line-clamp-4">
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
