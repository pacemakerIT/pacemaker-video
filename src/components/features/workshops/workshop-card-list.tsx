'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { WorkshopCard, WorkshopStatus } from '@/types/workshops';
import { useUserContext } from '@/app/context/user-context';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { ItemType } from '@prisma/client';
import { toast } from 'sonner';
import { resolveImageSrc } from '@/lib/utils';

interface Props {
  workshops: WorkshopCard[];
  filter: 'All' | WorkshopStatus;
  selectedMonth: Date;
  selectedTitle?: string | null; // 외부에서 전달된 title로 스크롤 및 열기
  onCloseDetail?: () => void;
}

export default function WorkshopCardList({
  workshops,
  filter,
  selectedMonth,
  selectedTitle,
  onCloseDetail
}: Props) {
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { user } = useUserContext();
  const userId = user?.id;
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();

  const isLiked = (id: string) =>
    favorites?.some((f) => f.itemId === id && f.itemType === ItemType.WORKSHOP);

  const toggleLike = (id: string) => {
    if (!userId) {
      toast.error('Please log in to use favorite.');
      return;
    }

    if (isLiked(id)) {
      removeFavorite(id, ItemType.WORKSHOP);
    } else {
      addFavorite(id, ItemType.WORKSHOP);
    }
  };

  const filtered = workshops.filter((w) => {
    const date = new Date(w.startDate);
    const inSelectedMonth =
      date.getFullYear() === selectedMonth.getFullYear() &&
      date.getMonth() === selectedMonth.getMonth();
    const matchesStatus = filter === 'All' || w.status === filter;
    return inSelectedMonth && matchesStatus;
  });

  const getDday = (start: string | Date) => {
    const startDate = new Date(start);
    const today = new Date();
    const diff = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0) return `${diff} days left`;
    if (diff === 0) return 'Today';
    return 'Ended';
  };

  function formatDateTime(dateStr: string | Date) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hour = date.getHours();
    const minute = date.getMinutes();
    const isPM = hour >= 12;
    const hour12 = hour % 12 || 12;
    const minuteStr =
      minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`;
    const ampm = isPM ? 'PM' : 'AM';
    return `${year}.${month}.${day} ${hour12}${minuteStr}${ampm}`;
  }

  const getStatusLabel = (status: WorkshopStatus) => {
    switch (status) {
      case WorkshopStatus.RECRUITING:
        return 'Open';
      case WorkshopStatus.CLOSED:
        return 'Closed';
      case WorkshopStatus.ONGOING:
        return 'Ongoing';
      case WorkshopStatus.COMPLETED:
        return 'Completed';
      default:
        return status;
    }
  };

  const getStatusClass = (status: WorkshopStatus) => {
    switch (status) {
      case WorkshopStatus.RECRUITING:
        return 'border-[#FF4F02]/20 bg-[#FF4F02]/[0.05] text-[#FF4F02]';
      case WorkshopStatus.CLOSED:
      case WorkshopStatus.ONGOING:
        return 'border-teal-500/20 bg-teal-50 text-teal-600';
      case WorkshopStatus.COMPLETED:
      default:
        return 'border-gray-200 bg-gray-100/70 text-gray-400';
    }
  };

  useEffect(() => {
    if (selectedTitle) {
      const matched = workshops.find((w) => w.title === selectedTitle); // 전체에서 찾기
      if (matched) {
        setOpenCardId(matched.id);
        const target = cardRefs.current[matched.id];
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [selectedTitle, workshops]);

  return (
    <div className="flex w-full flex-col space-y-6">
      {filtered.map((w) => {
        const isOpen = openCardId === w.id;
        const thumbnailSrc =
          resolveImageSrc({ thumbnail: w.thumbnail }) ??
          '/icons/workshop-card.svg';
        const instructorName = w.instructors[0]?.instructor?.name;

        return (
          <div
            key={w.id}
            ref={(el) => {
              cardRefs.current[w.id] = el;
            }} // 각 카드에 ref 연결
            className="pm-card-lift flex flex-col border border-gray-100 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(0,38,59,0.08)] md:min-h-[220px] md:flex-row md:items-center md:gap-5"
          >
            {/* 썸네일 + 좋아요 */}
            <div className="relative h-[180px] w-full flex-shrink-0 bg-gray-50 md:w-[260px]">
              <Image
                src={thumbnailSrc}
                alt={w.title}
                fill
                className="object-cover"
              />
              <button
                onClick={() => toggleLike(w.id)}
                aria-label="like"
                className="group absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-50 bg-white shadow-md"
              >
                <Heart
                  className={`h-[18px] w-[18px] transition-colors duration-200 ${
                    isLiked(w.id)
                      ? 'fill-[#FF4F02] text-[#FF4F02] group-hover:text-[#E04400]'
                      : 'text-gray-400 group-hover:fill-[#FF4F02] group-hover:text-[#FF4F02]'
                  }`}
                />
              </button>
            </div>

            {/* 정보 */}
            <div className="flex min-w-0 flex-grow flex-col pt-5 md:pt-0">
              <div>
                {/* 뱃지 + 카테고리 + D-day + 장바구니 */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-[38px] flex-wrap items-center gap-2 md:gap-4">
                    <span
                      className={`font-body rounded border px-2 py-0.5 text-[12px] font-bold md:text-[14px] ${getStatusClass(w.status)}`}
                    >
                      {getStatusLabel(w.status)}
                    </span>
                    <span className="font-body text-[12px] font-medium tracking-wide text-[#FF4F02] md:text-[14px]">
                      {w.category ?? 'Networking'}
                    </span>
                    <span className="font-body text-[12px] font-medium text-gray-400 md:text-[14px]">
                      {getDday(w.startDate)}
                    </span>
                  </div>

                  <button className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-gray-100">
                    <Image
                      src="/icons/cart.svg"
                      alt="장바구니"
                      width={18}
                      height={16}
                      className="cursor-pointer"
                    />
                  </button>
                </div>

                {/* 제목 + 가격 */}
                <div className="mb-1.5 flex items-start justify-between gap-4">
                  <h2 className="min-w-0 truncate font-headline text-[18px] font-medium leading-[26px] text-[#00263B] md:text-[24px] md:leading-[36px]">
                    {w.title}
                  </h2>
                  <p className="shrink-0 font-headline text-[22px] font-bold leading-[24px] text-[#00263B] md:text-[28px] md:leading-[30px]">
                    {w.price ? `$${w.price}` : 'Free'}
                  </p>
                </div>

                {/* 일정 / 장소 */}
                <div className="mb-2.5 flex min-h-[24px] flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-gray-500 md:gap-2 md:text-[16px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Date</span>
                    <span className="text-gray-300">|</span>
                    <span>{formatDateTime(w.startDate)}</span>
                  </div>
                  {instructorName &&
                    instructorName.toUpperCase() !== 'UNKNOWN' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Instructor</span>
                        <span className="text-gray-300">|</span>
                        <span>{instructorName}</span>
                      </div>
                    )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Location</span>
                    <span className="text-gray-300">|</span>
                    <span>{w.locationOrUrl ?? 'TBD'}</span>
                  </div>
                </div>

                {/* 설명 */}
                <p className="mb-1 mt-2 line-clamp-1 text-[14px] font-medium italic text-[#FF4F02] md:mt-3 md:text-[16px]">
                  {w.description || 'Turning Dreams Into Reality'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
