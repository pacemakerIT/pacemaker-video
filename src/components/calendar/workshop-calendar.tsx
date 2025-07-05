'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, dateFnsLocalizer, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';
import { Button } from '@/components/ui/button';
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  speaker: string;
  fee: string;
};

const events: CalendarEvent[] = [
  {
    title: 'Career Brew',
    start: new Date(2025, 6, 18),
    end: new Date(2025, 6, 18),
    speaker: 'SuJin Ku',
    fee: '₩20,000'
  },
  {
    title: 'UX Design workshop',
    start: new Date(2025, 6, 4),
    end: new Date(2025, 6, 4),
    speaker: 'Unknown',
    fee: 'Free'
  }
];

function CustomToolbar({ label, onNavigate }: ToolbarProps<CalendarEvent>) {
  return (
    <div className="relative w-full py-4">
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center md:w-14 md:h-14"
        onClick={() => onNavigate('PREV')}
      >
        <Image
          src="/icons/calendar-arrow-left.svg"
          alt="prev"
          width={56}
          height={56}
        />
      </button>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
        <p className="text-sm text-gray-400">
          6월에는 <span className="text-orange-500 font-semibold">5개</span>의
          워크숍이 있어요
        </p>
      </div>

      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center md:w-14 md:h-14"
        onClick={() => onNavigate('NEXT')}
      >
        <Image
          src="/icons/calendar-arrow-right.svg"
          alt="next"
          width={56}
          height={56}
        />
      </button>
    </div>
  );
}

export default function WorkshopCalendar() {
  const [openedEventId, setOpenedEventId] = useState<string | null>(null);

  return (
    <div className="p-6 rounded-xl bg-white shadow-md">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">페이스메이커 워크샵</h2>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month']}
        components={{
          toolbar: CustomToolbar,
          event: ({ event }) => {
            const isOpen = openedEventId === event.title;
            return (
              <div className="space-y-1">
                <div
                  onClick={() => setOpenedEventId(isOpen ? null : event.title)}
                  className="cursor-pointer bg-[#FFF3E6] text-[#FF9631] text-sm rounded px-2 py-[2px] font-medium truncate"
                >
                  {event.title}
                </div>
                {isOpen && (
                  <div className="mt-1 bg-[#FFF3E6] rounded-lg p-3 shadow-md text-[#666666] text-xs space-y-1">
                    <p>
                      <span className="text-[#FF9631] font-semibold">
                        {event.title}
                      </span>
                    </p>
                    <p>강사: {event.speaker}</p>
                    <p>참가비: {event.fee}</p>
                    <Button className="mt-1 h-7 px-3 text-xs bg-[#FF9631] hover:bg-[#ff7e00] text-white">
                      자세히 보기
                    </Button>
                  </div>
                )}
              </div>
            );
          }
        }}
      />
    </div>
  );
}
