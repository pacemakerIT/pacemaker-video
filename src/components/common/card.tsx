import Image from 'next/image';
import { Button } from '../ui/button';
import { ArrowRight, Heart } from 'lucide-react';
import { CustomBadge } from './custom-badge';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ItemType } from '@prisma/client';

// CustomBadge를 쓰는 쪽에서 category 영문 → 한글 변환
// (영문 페이지는 매핑 교체로 재사용 가능, CustomBadge 수정 불필요)
const categoryMap: Record<string, string> = {
  Marketing: '마케팅',
  Design: '디자인',
  Public: '북미 공무원',
  IT: 'IT',
  Accounting: '재무회계',
  Service: '서비스',
  Interview: '인터뷰',
  Resume: '이력서',
  Networking: '네트워킹'
};

interface CardProps extends OnlineCards {
  itemType: ItemType; // WORKSHOP, DOCUMENT, VIDEO
  imageUrl?: string;
}

export default function Card({
  videoId,
  title,
  price,
  description,
  category,
  itemType,
  imageUrl
}: CardProps) {
  const [isLiked, setIsLiked] = useState(false);

  // 랜덤 이미지 선택
  const ImageUrl = useMemo(() => {
    if (itemType === ItemType.DOCUMENT) {
      // DB에서 받은 이미지 URL 사용
      return imageUrl ?? '/img/ebook-default.png'; // OnlineCards 타입에 imageUrl이 있어야 함
    } else if (itemType === ItemType.VIDEO) {
      // course는 랜덤 이미지
      const images = [
        '/img/course_image1.png',
        '/img/course_image2.png',
        '/img/course_image3.png'
      ];
      const randomIndex = Math.floor(Math.random() * images.length);
      return images[randomIndex];
    }
    // TO-DO: 워크샵 등 다른 타입 처리
    return '/img/default.png';
  }, [itemType, imageUrl]);

  return (
    <div className="cursor-pointer">
      {/* TO-DO : courses, ebooks, workshop 분기 처리 필요 */}
      <Link href={`/courses/${videoId}`}>
        <div className="w-[588px] bg-white rounded-lg shadow-sm border-pace-gray-100 border hover:shadow-xl dark:bg-gray-950 relative">
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

          <div className="w-[588px] h-[331px] relative overflow-hidden rounded-t-lg">
            <Image
              src={ImageUrl}
              fill
              className="object-cover object-center"
              alt="courses img"
              data-testid="card-image"
              sizes="588px"
            />
          </div>

          <div className="w-[588px] p-6 flex flex-col gap-4 justify-start items-start">
            <div className="w-full flex flex-col gap-2">
              {category && (
                <CustomBadge
                  variant={category}
                  className="w-fit flex justify-center items-center py-2 px-3"
                >
                  {categoryMap[category] || category}
                </CustomBadge>
              )}
              <div className="w-full flex justify-between items-center">
                <h3 className="text-2xl font-semibold pace-gray-500">
                  {title}
                </h3>
                <span className="text-[28px] font-bold">{`$${price}`}</span>
              </div>
            </div>
            <p className="w-full min-h-[72px] line-clamp-3 text-pace-stone-500 font-normal">
              {description}
            </p>
            <Button
              variant="link"
              className="!text-pace-lg text-pace-orange-650 p-0 h-5"
            >
              {`자세히 보기`}
              <ArrowRight width={20} height={20} />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
