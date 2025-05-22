import Image from 'next/image';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { CustomBadge } from './CustomBadge';
import { OnlineCards } from '@/types/online';
import Link from 'next/link';

export default function Card({
  id,
  title,
  price,
  description,
  image,
  category
}: OnlineCards) {
  return (
    <div className="w-[558px] cursor-pointer">
      <Link href={`/courses/${id}`}>
        <div className="bg-white rounded-lg shadow-sm border-[#EEEEEE] border overflow-hidden transition-all duration-300 hover:shadow-xl dark:bg-gray-950">
          <Image
            src={image}
            width={588}
            height={582}
            className="w-full h-64 object-cover"
            style={{ aspectRatio: '588/582', objectFit: 'cover' }}
            alt="courses img"
          />
          {category && (
            <div className="px-4 pt-4">
              <CustomBadge variant={category}>{category}</CustomBadge>
            </div>
          )}
          <div className="px-4 py-2 space-y-2">
            <div className="flex w-full justify-between items-center">
              <h3 className="text-2xl font-semibold pace-gray-500">{title}</h3>
              <span className="text-[28px] font-bold">{`$${price}`}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-normal">
              {description}
            </p>
            <Button variant="link" className="text-[#ED642D] py-4 px-0">
              {`자세히 보기`}
              <ArrowRight width={20} height={20} />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
