'use client';

import { MouseEvent, useState } from 'react';
import Image from 'next/image';
import { Calendar, dateFnsLocalizer, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';
import EventPopup from '@/components/calendar/event-popup';
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
    <div className="relative w-[1200px] mx-auto py-4 pb-8">
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center"
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
        <h2 className="font-bold text-[24px] text-[#333333] pb-2">{label}</h2>
        <p className="text-[#666666] text-[16px]">
          6월에는 <span className="text-[#FF8236]">5개</span>의 워크숍이 있어요
        </p>
      </div>

      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center"
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
  const [openedEvent, setOpenedEvent] = useState<CalendarEvent | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });

  const handleEventClick = (e: MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();

    const target = (e.target as HTMLElement).closest(
      '.rbc-event'
    ) as HTMLElement;

    if (!target) return;

    const rect = target.getBoundingClientRect();
    const top = rect.bottom + window.scrollY;
    const left = rect.left + window.scrollX;
    const width = rect.width;

    if (openedEvent?.title === event.title) {
      setOpenedEvent(null);
    } else {
      setOpenedEvent(event);
      setPopupPos({ top, left, width });
    }
  };

  return (
    <div
      className="max-w-[1200px] mx-auto p-6 rounded-xl bg-white"
      onClick={() => setOpenedEvent(null)}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month']}
        components={{
          toolbar: CustomToolbar,
          event: ({ event }) => (
            <div
              onClick={(e) => handleEventClick(e, event)}
              className="cursor-pointer bg-[#FFF3E6] text-[#FF9631] text-sm rounded px-2 py-[2px] font-medium truncate transition-all duration-200 hover:scale-[1.02]"
            >
              {event.title}
            </div>
          )
        }}
      />

      {/* TO-DO 강사명, 참가비 DB 연결 필요 / 자세히보기 버튼 클릭 시 해당 워크샵으로 이동 필요 */}
      {openedEvent && (
        <EventPopup
          top={popupPos.top}
          left={popupPos.left}
          width={popupPos.width}
          onClose={() => setOpenedEvent(null)}
        >
          {/* <p>강사 {openedEvent.speaker}</p> */}
          <p className="text-[14px] text-[#666666] pb-2">강사 구수진</p>
          {/* <p>참가비 {openedEvent.fee}</p> */}
          <p className="text-[14px] text-[#666666] pb-2">참가비 $20</p>
          <Button
            className="
              mt-1 w-[87px] h-[22px]
              bg-pace-orange-600 hover:bg-pace-orange-900
              text-white text-xs font-light
              rounded-full mx-auto block p-0 text-center
              flex items-center justify-center
              transition-all duration-200
            "
          >
            자세히 보기
          </Button>
        </EventPopup>
      )}
    </div>
  );
}
