import Image from 'next/image';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { CustomBadge } from './CustomBadge';
import Link from 'next/link';
import { useState } from 'react';
import resume from '../../public/img/resume_lecture.jpeg';
import { MyCard } from '@/types/my-card';

export default function MyPageCard({
  videoId,
  title,
  price,
  description,
  category,
  type
}: MyCard) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="cursor-pointer font-normal">
      <Link href={`/courses/${videoId}`}>
        <div className="w-96 bg-white rounded-lg overflow-hidden shadow-sm border-[#EEEEEE] border hover:shadow-xl dark:bg-gray-950 relative">
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

          <div className="w-96 h-64">
            <Image
              src={resume}
              width={384}
              height={256}
              className="w-full h-full object-cover"
              alt="courses img"
              data-testid="card-image"
            />
          </div>

          <div className="w-96 p-6 flex flex-col gap-4 justify-start items-start">
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
                <span className="text-pace-stone-600">{type}</span>
              </div>
              <div className="w-full flex justify-between items-center text-pace-gray-500">
                <h3 className="">{title}</h3>
                <span className="text-pace-xl font-bold">{`$${price}`}</span>
              </div>
              <div className="w-full h-[64px]">
                <p className="text-pace-sm text-pace-stone-500 line-clamp-3">
                  {description}
                </p>
              </div>
            </div>
            <div className="w-full flex justify-end">
              <Button variant="link" className="text-[#E86642] font-normal p-0">
                {`장바구니에 추가`}
                <Image
                  src="/icons/shopping-cart.svg"
                  alt="Cart"
                  width={20}
                  height={20}
                />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
