'use client';

import { useEffect, useState } from 'react';
import WorkshopCalendar from '@/components/features/workshops/workshop-calendar';
import WorkshopFilter from '@/components/features/workshops/workshop-filter';
import WorkshopCardList from '@/components/features/workshops/workshop-card-list';
import { WorkshopCard, WorkshopStatus } from '@/types/workshops';
import { toast } from 'sonner';

type FilterKey = 'All' | WorkshopStatus;

export default function WorkshopsPage() {
  const [filterStatus, setFilterStatus] = useState<FilterKey>('All');
  const [workshops, setWorkshops] = useState<WorkshopCard[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWorkshopTitle, setSelectedWorkshopTitle] = useState<
    string | null
  >(null); // 선택된 워크숍 title 상태

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch('/api/workshops');
        const data = await res.json();
        // API returns { workshops: WorkshopCard[], count: number }
        if (data.workshops) {
          setWorkshops(data.workshops);
        }
      } catch (err) {
        toast.error('Failed to load workshops: ' + err);
      }
    };

    fetchWorkshops();
  }, []);

  return (
    <div className="w-screen flex gap-20 flex-col">
      <div className="w-[62.5%] items-center mx-auto justify-center flex flex-col gap-8 pt-20">
        {/* 워크샵 헤더 */}
        <div className="w-full max-w-[1200px] text-left mx-auto">
          <p className="text-pace-orange-600 font-medium pb-2 text-base">
            Connections Create Opportunities
          </p>
          <h1 className="text-[32px] font-bold text-pace-black-500">
            Pacemaker Workshops
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
