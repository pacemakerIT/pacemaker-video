'use client';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

interface DetailHeroSectionProps {
  backgroundImage?: string;
  subtitle?: string;
  title?: string;
  courseTitle?: string;
  instructor?: string;
  description?: string;
  price?: string;
  onAddToCart?: () => void;
  onToggleLike?: (isLiked: boolean) => void;
  buttonText?: string;
  instructorLabel?: string;
  priceLabel?: string;
}

export default function DetailHeroSection({
  backgroundImage = '/img/video-bg.png',
  subtitle,
  title = '북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지',
  courseTitle = '자기소개서 작성 및 면접 준비까지 하나로!',
  instructor = 'Heilee, Linda, Raphael. Lee',
  description = '실제 캐나다 기업 합격 이력서를 바탕으로, 북미 인사 담당자들이 개발자 이력서에서 주목하는 구조와 표현을 분석해보세요!',
  price = '$999.99',
  onAddToCart,
  onToggleLike,
  buttonText = '장바구니 담기',
  instructorLabel = '강사',
  priceLabel = '금액'
}: DetailHeroSectionProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onToggleLike?.(newLikedState);
  };

  const handleAddToCart = () => {
    onAddToCart?.();
  };

  return (
    <div className="w-full flex justify-between items-center h-[600px] relative overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minWidth: '100%',
          minHeight: '100%'
        }}
      ></div>
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="w-[62.5%] min-w-[1200px] items-center mx-auto justify-center flex gap-8">
        {/* 왼쪽 60% - 부제목과 제목 */}
        <div className="w-[60%] flex flex-col justify-center items-start relative z-10">
          <div className="text-white/80 text-pace-lg font-medium mb-4">
            {subtitle}
          </div>
          <h1 className="text-white text-5xl font-bold leading-tight">
            {title}
          </h1>
        </div>

        {/* 오른쪽 40% - 강의 정보 카드 */}
        <div className="w-[40%] flex justify-center items-center px-8 relative z-10 ">
          <div className="flex flex-col bg-white backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-full max-w-[360px] gap-4">
            <h2 className="text-pace-xl font-medium text-pace-gray-500 mb-2">
              {courseTitle}
            </h2>
            <div className="flex justify-start items-center gap-4">
              <span>{instructorLabel}</span>
              <p className="text-pace-gray-500">{instructor}</p>
            </div>
            <p className="text-pace-stone-500 text-pace-sm leading-relaxed">
              {description}
            </p>
            <div className="flex justify-between items-center text-pace-lg">
              <span>{priceLabel}</span>
              <p className="text-pace-gray-500">${price}</p>
            </div>
            <div className="flex gap-3 justify-between items-center">
              <Button
                className="w-60 h-14 border-pace-orange-600 border text-pace-orange-600 bg-white px-8 py-4 rounded-full text-lg hover:text-white hover:bg-pace-orange-600"
                onClick={handleAddToCart}
              >
                {buttonText}
              </Button>
              <button
                role="button"
                aria-label="like"
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md z-10 group"
                onClick={handleLikeToggle}
              >
                <Heart
                  className={`w-[33.6px] h-[33.6px] transition-colors duration-200 ${
                    isLiked
                      ? 'text-pace-orange-800 fill-pace-orange-800'
                      : 'text-pace-gray-200 group-hover:text-pace-orange-800'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
