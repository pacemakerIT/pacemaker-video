'use client';

import WorkshopCalendar from '@/components/calendar/workshop-calendar';

export default function Page() {
  return (
    <div className="w-screen flex gap-20 flex-col">
      <div className="w-[62.5%] items-center mx-auto justify-center flex flex-col gap-8 pt-20">
        {/* 워크샵 헤더 */}
        <div className="w-full text-left">
          <p className="text-pace-lg text-pace-orange-600 font-light">
            만남이 큰 기회를 만드는
          </p>
          <h1 className="text-pace-3xl font-bold text-pace-black-500">
            페이스메이커 워크샵
          </h1>
        </div>

        {/* 캘린더 */}
        <WorkshopCalendar />
        <br></br>
      </div>
    </div>
  );
}
