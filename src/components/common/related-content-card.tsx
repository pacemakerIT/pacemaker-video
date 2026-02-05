'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { CustomBadge } from '@/components/common/custom-badge';

interface RelatedContentCardProps {
  itemId: string;
  title: string;
  price: number;
  category: string;
}

export default function RelatedContentCard({
  itemId,
  title,
  price,
  category
}: RelatedContentCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleCardClick = () => {
    window.location.href = `/courses/${itemId}`;
  };

  return (
    <div className="w-full cursor-pointer font-normal">
      <div
        className="w-full bg-white rounded-lg overflow-hidden shadow-sm border-[#EEEEEE] border hover:shadow-xl dark:bg-gray-950 relative"
        onClick={handleCardClick}
      >
        <button
          role="button"
          aria-label="like"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-100 z-10 group"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 ${
              isLiked
                ? 'text-pace-orange-800 fill-pace-orange-800'
                : 'text-pace-gray-200 group-hover:text-pace-orange-800'
            }`}
          />
        </button>

        <div className="w-full aspect-[3/2]">
          <Image
            src="/img/resume_lecture.jpeg"
            width={384}
            height={256}
            className="w-full h-full object-cover"
            alt="courses img"
            data-testid="card-image"
          />
        </div>

        <div className="w-full p-6 flex flex-col justify-start items-start gap-4">
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-center text-pace-sm">
              {category && (
                <CustomBadge
                  variant={category}
                  className="w-fit min-w-14 flex justify-center items-center py-2 px-3"
                >
                  {category}
                </CustomBadge>
              )}
            </div>

            <div className="w-full flex justify-between items-start text-pace-gray-500">
              <h3 className="text-pace-base">{title}</h3>
              <span className="text-pace-xl font-bold">{`$${price}`}</span>
            </div>
          </div>

          <div className="w-full flex justify-start">
            <div className="text-[#E86642] font-normal p-0 inline-flex items-center gap-2">
              {`자세히 보기`}
              <Image
                src="/icons/arrow-right.svg"
                alt="View Details"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
