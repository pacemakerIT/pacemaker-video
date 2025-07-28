'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { calendarStyleMap } from '@/components/ui/calendar-style-map';
import { WorkshopCard, WorkshopStatus } from '@/types/workshops';

interface Props {
  workshops: WorkshopCard[];
  filter: '전체' | WorkshopStatus;
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
  const [likedWorkshops, setLikedWorkshops] = useState<Record<string, boolean>>(
    {}
  );
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({}); // 카드별 ref 저장용

  const toggleLike = (id: string) => {
    setLikedWorkshops((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filtered = workshops.filter((w) => {
    const date = new Date(w.startDate);
    const inSelectedMonth =
      date.getFullYear() === selectedMonth.getFullYear() &&
      date.getMonth() === selectedMonth.getMonth();

    const matchesStatus = filter === '전체' || w.status === filter;

    return inSelectedMonth && matchesStatus;
  });

  const getDday = (start: string) => {
    const startDate = new Date(start);
    const today = new Date();
    const diff = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 ? `D-${diff}` : '종료';
  };

  function formatDateTime(dateStr: string) {
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
    <div className="w-full max-w-[1200px] flex flex-col">
      {filtered.map((w) => {
        const isOpen = openCardId === w.id;
        const style = calendarStyleMap[w.status];

        return (
          <div
            key={w.id}
            ref={(el) => {
              cardRefs.current[w.id] = el;
            }} // 각 카드에 ref 연결
            className="w-full border border-pace-stone-200 rounded-xl overflow-hidden"
          >
            <div className="flex">
              {/* 썸네일 + 좋아요 */}
              <div className="w-[384px] h-[320px] py-8 flex-shrink-0">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src="/img/workshop-card.svg"
                    alt={w.title}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => toggleLike(w.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md"
                  >
                    {/* TO-DO: 찜 상태 연동 */}
                    <Heart
                      className={`w-5 h-5 transition-colors duration-200 ${
                        likedWorkshops[w.id]
                          ? 'text-pace-orange-800 fill-pace-orange-800'
                          : 'text-pace-gray-200 hover:text-pace-orange-800'
                      }`}
                      fill={likedWorkshops[w.id] ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>

              {/* 정보 */}
              <div className="flex-1 py-12 px-6 flex flex-col justify-between gap-2">
                {/* 뱃지 + 카테고리 + D-day + 장바구니 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`h-[38px] w-[85px] px-3 py-[8px] rounded-full text-pace-base font-medium border flex items-center justify-center ${style.text} ${style.border}`}
                    >
                      {w.status === 'RECRUITING'
                        ? '모집중'
                        : w.status === 'ONGOING'
                          ? '진행중'
                          : '진행완료'}
                    </span>
                    {/* TO-DO: category 필드 생기면 대체 */}
                    <span className="text-pace-orange-800 text-pace-sm">
                      네트워킹
                    </span>
                    <span className="text-pace-stone-500 text-pace-sm">
                      {getDday(w.startDate)}
                    </span>
                  </div>

                  {/* TO-DO: 장바구니 아이콘 기능 확인 */}
                  <div className="flex items-center pr-4">
                    <Image
                      src="/icons/cart.svg"
                      alt="장바구니"
                      width={28}
                      height={28}
                      className="cursor-pointer mr-2"
                    />
                  </div>
                </div>

                {/* 제목 + 가격 */}
                <div className="flex items-center justify-between px-3">
                  <h2 className="text-pace-xl font-semibold text-pace-black-500">
                    {w.title}
                  </h2>
                  <p className="text-[28px] font-bold text-pace-black-500">
                    {w.price ? `$${w.price}` : 'Free'}
                  </p>
                </div>

                {/* 일정 / 장소 */}
                <p className="text-pace-base text-pace-stone-500 px-3">
                  일정 | {formatDateTime(w.startDate)} &nbsp;&nbsp; 강사 |{' '}
                  {w.instructor?.name ?? '미정'} &nbsp;&nbsp; 장소 |{' '}
                  {w.locationOrUrl ?? 'TBD'}
                </p>

                {/* 설명 */}
                <p className="text-pace-base text-pace-stone-500 px-3">
                  꿈을 현실로 만드는 이야기{' '}
                  {/* TO-DO: 워크숍 highlight 문구 필드 생기면 대체 */}
                </p>

                {/* 펼치기 버튼 - 닫혀있을 때만 표시 */}
                {!isOpen && (
                  <button
                    onClick={() => setOpenCardId(w.id)}
                    className="text-sm font-light text-pace-stone-800 bg-pace-ivory-500 w-full h-10 px-2 rounded-md hover:opacity-90 transition flex items-center justify-center gap-1"
                  >
                    More detail <ChevronDown size={14} className="ml-1" />
                  </button>
                )}

                {/* 펼쳐졌을 때 하단 설명 */}
                {isOpen && (
                  <div className="mt-2 bg-pace-ivory-500 text-sm text-pace-stone-600 p-6 rounded-b-xl">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      {/* 강사 정보 */}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-pace-sm text-pace-black-500 mb-2">
                          강사
                        </h4>
                        <p className="font-bold text-pace-base text-pace-black-500 mb-2">
                          {w.instructor?.name}
                        </p>
                        <p>
                          Employer Strategy & Engagement Specialist at
                          University of Toronto, Career Coach
                        </p>
                        {/* TO-DO: instructor.title, organization 필드 필요 */}
                      </div>

                      {/* 커리큘럼 */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-pace-sm text-pace-black-500 mb-2">
                          커리큘럼
                        </h4>
                        <ul className="space-y-1">
                          {[
                            'Session 01',
                            'Session 02',
                            'Session 03',
                            'Session 04'
                          ].map((s, i) => (
                            <li
                              key={i}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-pace-gray-700 text-pace-sm">
                                  {s}
                                </span>
                                {/* TO-DO: Start 버튼 클릭 시 이동 */}
                                <button className="text-pace-stone-500 text-pace-sm">
                                  Start
                                </button>
                              </div>
                              {/* TO-DO: 재생 버튼 클릭 시 이동 */}
                              <button className="text-pace-stone-500 text-pace-sm">
                                <Image
                                  src="/icons/video-circle.svg"
                                  alt="재생"
                                  width={16}
                                  height={16}
                                  className="cursor-pointer mr-2"
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {/* TO-DO: 실제 커리큘럼 리스트 연결 */}
                      </div>
                    </div>

                    {/* TO-DO: 강사 소개 멘트 변경 필요*/}
                    <div className="mt-6 text-pace-sm text-pace-gray-700 whitespace-pre-line leading-relaxed">
                      “모든 사람은 저마다 빛나는 강점과 잠재력을 가지고 있어요.”
                      <br />
                      글로벌 커리어 환경에서의 도전과 극복, 네트워킹의 힘,
                      그리고 “나만의 길”을 찾는 방법에 대한 따뜻한 조언들이
                      기다리고 있습니다.
                      <br />
                      토론토 대학의 구수진 커리어 코치님의 강의를 들을 수 있는
                      특별한 기회를 놓치지 마세요!
                    </div>

                    {/* 닫기 버튼 */}
                    <button
                      onClick={() => {
                        setOpenCardId(null);
                        onCloseDetail?.();
                      }}
                      className="mt-6 text-sm font-light text-pace-stone-800 bg-pace-ivory-500 w-full h-10 px-2 rounded-md hover:opacity-90 transition flex items-center justify-center gap-1"
                    >
                      Close <ChevronUp size={14} className="ml-1" />
                    </button>
                    {/* TO-DO: instructor.bio */}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
