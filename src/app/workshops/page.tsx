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
    <main id="main-content" className="bg-white py-[60px] font-body">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col px-4">
        {/* 워크샵 헤더 */}
        <div className="mb-8 text-center md:text-left">
          <p className="mb-2 font-manrope text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F02]">
            Connections Create Opportunities
          </p>
          <h1 className="font-headline text-3xl font-extrabold leading-tight text-[#00263B] md:text-4xl">
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
      </div>
    </main>
  );
}
