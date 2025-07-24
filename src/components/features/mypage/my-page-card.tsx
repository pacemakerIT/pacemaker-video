// /mypage/page.tsx - 온라인 강의, 전자책 카드
// /mypage/cart/page.tsx - You Might Also Like 카드

'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MyCard } from '@/types/my-card';
import { CustomBadge } from '@/components/common/custom-badge';

export default function MyPageCard({
  itemId,
  title,
  price,
  description,
  category,
  type,
  purchased,
  totalChapters,
  completedChapters,
  like
}: MyCard) {
  const [isLiked, setIsLiked] = useState(like);

  const progress =
    totalChapters && completedChapters
      ? (completedChapters / totalChapters) * 100
      : 0;

  return (
    <div className="w-full cursor-pointer font-normal">
      <Link href={`/courses/${itemId}`}>
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-sm border-[#EEEEEE] border hover:shadow-xl dark:bg-gray-950 relative">
          {!purchased && (
            <button
              role="button"
              aria-label="like"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-100 z-10"
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isLiked
                    ? 'text-pace-orange-800 fill-pace-orange-800'
                    : 'text-pace-gray-200 hover:text-pace-orange-800'
                }`}
              />
            </button>
          )}

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

          <div className="w-full p-6 flex flex-col gap-4 justify-start items-start">
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex justify-between items-center text-pace-sm">
                {category && (
                  <CustomBadge
                    variant={category}
                    className="w-fit flex justify-center items-center py-2 px-3"
                  >
                    {category}
                  </CustomBadge>
                )}

                {purchased ? (
                  <div className="flex items-center justify-end w-full">
                    <span className="text-pace-sm text-pace-stone-600">{`${completedChapters}/${totalChapters} 
                    ${type === '온라인 강의' ? '레슨' : type === '전자책' ? '페이지' : ''} 남음`}</span>
                  </div>
                ) : (
                  <span className="text-pace-stone-600">{type}</span>
                )}
              </div>

              <div className="w-full flex justify-between items-center text-pace-gray-500">
                <h3 className="">{title}</h3>

                {!purchased ? (
                  <span className="text-pace-xl font-bold">{`$${price}`}</span>
                ) : null}
              </div>
              {purchased ? (
                totalChapters && completedChapters ? (
                  <div className="w-full mt-2">
                    <Progress value={progress} />
                  </div>
                ) : (
                  <Progress value={0} />
                )
              ) : (
                <div className="w-full h-[64px]">
                  <p className="text-pace-sm text-pace-stone-500 line-clamp-3">
                    {description}
                  </p>
                </div>
              )}
            </div>
            {purchased ? (
              <div className="w-full flex justify-between items-center">
                <p className="text-pace-sm text-pace-gray-700">
                  {`${progress}% 완료`}
                </p>
                <Button
                  variant="link"
                  className="text-[#E86642] !text-pace-base font-normal p-0 gap-1"
                >
                  {progress === 100
                    ? '수강리뷰 쓰러가기'
                    : progress === 0
                      ? '수강 시작하기'
                      : '이어서 수강하기'}
                  <span>
                    <Image
                      src="/icons/arrow-right.svg"
                      alt="arrow-right"
                      width={20}
                      height={20}
                    />
                  </span>
                </Button>
              </div>
            ) : (
              <div className="w-full flex justify-end">
                <Button
                  variant="link"
                  className="text-[#E86642] font-normal p-0"
                >
                  {`장바구니에 추가`}
                  <Image
                    src="/icons/shopping-cart.svg"
                    alt="Cart"
                    width={20}
                    height={20}
                  />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
