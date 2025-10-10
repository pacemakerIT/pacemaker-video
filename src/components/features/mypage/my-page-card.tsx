// /mypage/page.tsx - 온라인 강의, 전자책 카드
// /mypage/cart/page.tsx - You Might Also Like 카드

'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useCartContext } from '@/app/context/cart-context';
import { useUserContext } from '@/app/context/user-context';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { itemCategoryLabel, itemTypeLabels } from '@/constants/labels';
import { MyCard } from '@/types/my-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CustomBadge } from '@/components/common/custom-badge';
import ReviewForm from './review-form';

export default function MyPageCard({
  itemId,
  title,
  price,
  description,
  category,
  type,
  date,
  purchased,
  totalChapters,
  completedChapters
}: MyCard) {
  const { addToCart } = useCartContext();
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();

  const { user } = useUserContext();
  const userId = user?.id;

  const progress =
    totalChapters && completedChapters
      ? (completedChapters / totalChapters) * 100
      : 0;

  const isLiked = (id: string) => favorites?.some((f) => f.itemId === id);

  const handleAddToCart = () => {
    if (!userId) {
      toast.error('Please log in to use cart.');
      return;
    }

    addToCart(itemId, type);
  };

  const toggleLike = (id: string) => {
    if (!userId) {
      toast.error('Please log in to use favorite.');
      return;
    }

    if (isLiked(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id, type);
    }
  };
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
                toggleLike(itemId);
              }}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  isLiked(itemId)
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
                {date && (
                  <p className="my-2">
                    {date.toISOString().slice(0, 10).replace(/-/g, '.')}
                  </p>
                )}
                {category && (
                  <CustomBadge
                    variant={itemCategoryLabel[category] ?? category}
                    className="w-fit flex justify-center items-center py-2 px-3"
                  >
                    {itemCategoryLabel[category] ?? category}
                  </CustomBadge>
                )}

                {purchased ? (
                  <div className="flex items-center justify-end w-full">
                    <span className="text-pace-sm text-pace-stone-600">{`${completedChapters}/${totalChapters} 
                    ${itemTypeLabels[type] === '온라인 강의' ? '레슨' : itemTypeLabels[type] === '전자책' ? '페이지' : ''} 남음`}</span>
                  </div>
                ) : (
                  <span className="text-pace-stone-600">
                    {itemTypeLabels[type]}
                  </span>
                )}
              </div>

              <div className="w-full flex justify-between items-center text-pace-gray-500">
                <h3 className="">{title}</h3>

                {!purchased ? (
                  <span className="text-pace-xl font-bold">{`$${price ?? 0}`}</span>
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
                <ReviewForm progress={progress} />
              </div>
            ) : (
              <div className="w-full flex justify-end">
                <Button
                  variant="link"
                  className="text-[#E86642] font-normal p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                >
                  장바구니에 추가
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
