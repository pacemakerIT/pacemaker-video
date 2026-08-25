'use client';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { ItemType } from '@prisma/client';

interface DetailHeroSectionProps {
  backgroundImage?: string;
  visualTitle?: string;
  visualTitle2?: string;
  title?: string;
  instructor?: string;
  description?: string;
  price?: string;
  onAddToCart?: () => void;
  onToggleLike?: (isLiked: boolean) => void;
  isLiked?: boolean;
  buttonText?: string;
  instructorLabel?: string;
  priceLabel?: string;
  itemType?: ItemType;
}

export default function DetailHeroSection({
  backgroundImage,
  visualTitle,
  visualTitle2 = '북미 취업의 정석: 차별화된 이력서부터 잡오퍼를 부르는 인터뷰까지',
  title = '자기소개서 작성 및 면접 준비까지 하나로!',
  instructor = 'Heilee, Linda, Raphael. Lee',
  description = '실제 캐나다 기업 합격 이력서를 바탕으로, 북미 인사 담당자들이 개발자 이력서에서 주목하는 구조와 표현을 분석해보세요!',
  price = '$999.99',
  onAddToCart,
  onToggleLike,
  isLiked = false,
  buttonText = '장바구니 담기',
  instructorLabel = 'Instructors',
  priceLabel = 'Price',
  itemType
}: DetailHeroSectionProps) {
  const isCourse = itemType === ItemType.COURSE;
  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleLike?.(!isLiked);
  };

  const handleAddToCart = () => {
    onAddToCart?.();
  };

  return (
    <div className="w-full flex justify-between items-center h-[600px] relative overflow-hidden">
      {/* 배경 이미지 및 오버레이 */}
      {backgroundImage ? (
        <>
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
          <div
            className={`absolute inset-0 ${isCourse ? 'bg-black/40' : ''}`}
          ></div>
        </>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}
      <div className="w-[62.5%] min-w-[1200px] items-center mx-auto justify-center flex gap-8">
        {/* 왼쪽 60% - 부제목과 제목 */}
        <div className="w-[60%] flex flex-col justify-center items-start relative z-10">
          <div
            className={`text-[28px] font-heading font-medium tracking-wide mb-4 whitespace-pre-line ${
              isCourse ? 'text-white/80' : 'text-black/80'
            }`}
          >
            {visualTitle}
          </div>
          <h1
            className={`text-[40px] font-heading font-bold leading-[1.3] tracking-tight whitespace-pre-line ${
              isCourse ? 'text-white' : 'text-black'
            }`}
          >
            {visualTitle2}
          </h1>
        </div>

        {/* 오른쪽 40% - 강의 정보 카드 */}
        <div className="w-[40%] flex justify-center items-center px-8 relative z-10 ">
          {isCourse ? (
            <div className="flex flex-col bg-white rounded-none p-7 shadow-[0_10px_30px_rgba(0,38,59,0.08)] w-full max-w-[360px] min-h-[382px] justify-between gap-4 border border-gray-100 hover:-translate-y-[10px] hover:shadow-[0_20px_40px_rgba(0,38,59,0.12)] transition-[transform,box-shadow] duration-300">
              <div>
                <h2 className="text-[1.5rem] font-heading font-bold text-[#00263b] leading-tight mb-4">
                  {title}
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3 text-[0.875rem]">
                    <span className="font-bold text-[#00263b] min-w-[80px]">
                      {instructorLabel}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {instructor}
                    </span>
                  </div>
                  <p className="text-[0.875rem] text-gray-500 leading-snug line-clamp-3">
                    {description}
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-5">
                  <span className="font-bold text-[#00263b] text-sm">
                    {priceLabel}
                  </span>
                  <span className="text-2xl font-heading font-bold text-[#00263b]">
                    $
                    {typeof price === 'number'
                      ? (price as number).toLocaleString()
                      : Number(
                          String(price).replace(/[^0-9.]/g, '')
                        ).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <Button
                    className="flex-1 h-auto bg-[#ff4f02] text-white font-heading font-bold py-4 px-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] hover:bg-[#e04400] hover:scale-[1.02] transition-all text-lg"
                    onClick={handleAddToCart}
                  >
                    {buttonText}
                  </Button>
                  <button
                    role="button"
                    aria-label="like"
                    className="w-12 h-12 flex items-center justify-center border border-gray-100 rounded-xl text-[#ff4f02] hover:bg-[#ff4f02]/5 transition-all shadow-sm hover:-translate-y-[3px] group"
                    onClick={handleLikeToggle}
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isLiked
                          ? 'text-[#ff4f02] fill-[#ff4f02]'
                          : 'text-gray-300 fill-transparent group-hover:text-[#ff4f02]'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col bg-white backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-full max-w-[360px] gap-4">
              <h2 className="text-pace-xl font-medium text-pace-gray-500 mb-2">
                {title}
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
                <p className="text-pace-gray-500">
                  $
                  {typeof price === 'number'
                    ? (price as number).toLocaleString()
                    : Number(
                        String(price).replace(/[^0-9.]/g, '')
                      ).toLocaleString()}
                </p>
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
          )}
        </div>
      </div>
    </div>
  );
}
