'use client';

import { useEffect, useState } from 'react';
import WorkshopCalendar from '@/components/features/workshops/workshop-calendar';
import WorkshopFilter from '@/components/features/workshops/workshop-filter';
import WorkshopCardList from '@/components/features/workshops/workshop-card-list';
import { WorkshopCard, WorkshopStatus } from '@/types/workshops';
import { toast } from 'sonner';

type FilterKey = '전체' | WorkshopStatus;

export default function Page() {
  const [filterStatus, setFilterStatus] = useState<FilterKey>('전체');
  const [workshops, setWorkshops] = useState<WorkshopCard[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWorkshopTitle, setSelectedWorkshopTitle] = useState<
    string | null
  >(null); // 선택된 워크숍 title 상태

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        // TO-DO: DB 완료 후 API 연결필요
        // mock 데이터 불러오기 (public/json/workshop.json)
        const res = await fetch('/json/workshops.json');
        const data = await res.json();
        setWorkshops(data); // data 자체가 배열이면 그대로 세팅
      } catch (err) {
        toast('워크숍 불러오기 실패:' + err);
      }
    };

    fetchWorkshops();
  }, []);

  return (
    <div className="w-screen flex gap-20 flex-col">
      <div className="w-[62.5%] items-center mx-auto justify-center flex flex-col gap-8 pt-20">
        {/* 워크샵 헤더 */}
        <div className="w-full max-w-[1200px] text-left mx-auto">
          <p className="text-pace-lg text-pace-orange-600 font-light">
            만남이 큰 기회를 만드는
          </p>
          <h1 className="text-pace-3xl font-bold text-pace-black-500">
            페이스메이커 워크샵
          </h1>
        </div>

        {/* 캘린더 */}
        <WorkshopCalendar
          onMonthChange={setCurrentMonth}
          onSelectWorkshop={(title) => {
            setSelectedWorkshopTitle(title); // 상세 버튼 클릭 시 워크숍 타이틀 설정
          }}
        />

        {/* 필터 버튼 */}
        <WorkshopFilter selected={filterStatus} onChange={setFilterStatus} />

        {/* 카드 리스트 */}
        <WorkshopCardList
          filter={filterStatus}
          workshops={workshops}
          selectedMonth={currentMonth}
          selectedTitle={selectedWorkshopTitle} // 선택된 워크숍 title 전달
          onCloseDetail={() => setSelectedWorkshopTitle(null)} // 상세 닫을 때 상태 초기화
        />

        <br />
      </div>
    </div>
  );
}
