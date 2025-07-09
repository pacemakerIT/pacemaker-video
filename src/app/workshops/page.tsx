'use client';

import WorkshopCalendar from '@/components/calendar/workshop-calendar';

export default function Page() {
  return (
    <div className="w-full flex justify-center px-4">
      <div className="max-w-[750px] w-full flex flex-col items-center gap-8">
        <WorkshopCalendar />
      </div>
    </div>
  );
}
