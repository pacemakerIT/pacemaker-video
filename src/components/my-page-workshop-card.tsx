// /mypage/page.tsx - 워크샵 카드

import Image from 'next/image';
import Link from 'next/link';
import { MyWorkshopCard } from '@/types/my-card';
import { Button } from './ui/button';
import resume from '../../public/img/resume_lecture.jpeg';

export default function MyPageWorkshopCard({
  itemId,
  title,
  date
}: MyWorkshopCard) {
  return (
    <div className="w-full cursor-pointer font-normal">
      <Link href={`/workshops/${itemId}`}>
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-sm border-[#EEEEEE] border hover:shadow-xl dark:bg-gray-950 relative">
          <div className="w-full aspect-[3/2]">
            <Image
              src={resume}
              width={384}
              height={256}
              className="w-full h-full object-cover"
              alt="courses img"
              data-testid="card-image"
            />
          </div>

          <div className="w-full p-6 flex flex-col gap-4 justify-start items-start">
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex justify-between items-center text-pace-gray-500">
                <h3 className="">{title}</h3>
              </div>
            </div>
            <div className="w-full flex justify-between items-center text-pace-gray-700">
              <p className="text-pace-sm">
                {date < new Date() ? '워크샵 완료' : '워크샵 등록 완료'}
              </p>
              <Button variant="link" className="h-auto font-normal p-0 gap-1">
                {date >= new Date() && (
                  <>
                    <p className="text-[#E86642] text-pace-base">
                      워크샵 확인하기
                    </p>
                    <span>
                      <Image
                        src="/icons/arrow-right.svg"
                        alt="arrow-right"
                        width={20}
                        height={20}
                      />
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
