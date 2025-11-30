import Image from 'next/image';
import { Button } from './ui/button';
import { ArrowRight, Heart } from 'lucide-react';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function ImageOverlayCard({
  itemId,
  title,
  category
}: OnlineCards) {
  const [isLiked, setIsLiked] = useState(false);

  // 워크샵용 랜덤 이미지 선택
  const randomImage = useMemo(() => {
    const images = [
      '/img/workshop_image1.png',
      '/img/workshop_image2.png',
      '/img/workshop_image3.png',
      '/img/workshop_image4.png'
    ];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }, []);

  const displayTitle = title || '';

  return (
    <div className="cursor-pointer" data-testid="image-overlay-card">
      <Link href={`/courses/${itemId}`}>
        <div className="w-[384px] bg-white rounded-lg dark:bg-gray-950 relative overflow-hidden group transition-transform duration-300 hover:scale-105">
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

          <div className="relative w-full h-[331px]">
            <Image
              src={randomImage}
              fill
              className="object-cover"
              alt="courses img"
              data-testid="card-image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute justify-between items-start h-full flex-col flex gap-8 top-0 left-0 right-0 p-6 text-white max-w-80">
              <div className="flex flex-col gap-2">
                {category && (
                  <p className="text-pace-orange-800 text-pace-sm">
                    {category}
                  </p>
                )}
                <div className="flex justify-between items-center max-w-72 ">
                  <h3 className="text-xl font-semibold text-white">
                    {displayTitle}
                  </h3>
                </div>
                <p className="line-clamp-2 text-white/90 font-normal">
                  일정 | 2025.05.20
                </p>
                <p className="line-clamp-2 text-white/90 font-normal">
                  장소 | North York centre
                </p>
              </div>
              <Button
                variant="link"
                className="text-white p-0 h-5 hover:text-pace-orange-800"
              >
                {`신청하기`}
                <ArrowRight width={20} height={20} />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-[#EEEEEE] flex justify-center">
            <span className="text-sm text-gray-600">진행중</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
