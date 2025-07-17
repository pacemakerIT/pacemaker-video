'use client';

import { MouseEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar, dateFnsLocalizer, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/components/calendar/calendar-custom.css';
import EventPopup from '@/components/calendar/event-popup';
import { Button } from '@/components/ui/button';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { calendarStyleMap } from '@/components/ui/calendar-style-map';

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

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  speaker: string;
  fee: string;
  status: 'RECRUITING' | 'CLOSED' | 'ONGOING' | 'COMPLETED';
};

type WorkshopFromApi = {
  title: string;
  startDate: string;
  endDate: string;
  price: number | null;
  status: string;
  instructor: {
    name: string | null;
  } | null;
};

const monthMap: { [key: string]: string } = {
  January: '1\uC6D4',
  February: '2\uC6D4',
  March: '3\uC6D4',
  April: '4\uC6D4',
  May: '5\uC6D4',
  June: '6\uC6D4',
  July: '7\uC6D4',
  August: '8\uC6D4',
  September: '9\uC6D4',
  October: '10\uC6D4',
  November: '11\uC6D4',
  December: '12\uC6D4'
};

function CustomToolbar({
  label,
  onNavigate,
  count
}: ToolbarProps<CalendarEvent> & { count: number }) {
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
        <h2 className="font-bold text-pace-xl text-pace-gray-700 pb-2">
          {label}
        </h2>
        <p className="text-pace-stone-500 text-pace-base">
          {monthMap[label.split(' ')[0]]}에는{' '}
          <span className="text-pace-orange-600">{count}개</span>의 워크숍이
          있어요
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [count, setCount] = useState(0);
  const [openedEvent, setOpenedEvent] = useState<CalendarEvent | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });

  const fetchWorkshops = async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    try {
      const res = await fetch(`/api/workshops?year=${year}&month=${month}`);
      const text = await res.text();
      const json = text ? JSON.parse(text) : { workshops: [], count: 0 };
      const { workshops, count } = json;

      const formatted = workshops.map((w: WorkshopFromApi) => ({
        title: w.title,
        start: new Date(w.startDate),
        end: new Date(w.endDate),
        speaker: w.instructor?.name ?? 'Unknown',
        fee: w.price ? `$${w.price.toLocaleString()}` : 'Free',
        status: w.status as CalendarEvent['status']
      }));

      setEvents(formatted);
      setCount(count);
    } catch (error) {
      toast(`Failed to fetch /api/workshops: ${error}`);
    }
  };

  useEffect(() => {
    const today = new Date();
    fetchWorkshops(today);
  }, []);

  const handleEventClick = (e: MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    const target = (e.target as HTMLElement).closest(
      '.rbc-event-content'
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

  const handleNavigate = (newDate: Date) => {
    fetchWorkshops(newDate);
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
        onNavigate={handleNavigate}
        components={{
          toolbar: (props) => <CustomToolbar {...props} count={count} />,
          event: ({ event }) => (
            <div
              onClick={(e) => handleEventClick(e, event)}
              className={`cursor-pointer text-sm rounded px-2 py-[2px] font-medium truncate transition-all duration-200 hover:scale-[1.02] ${calendarStyleMap[event.status].event}`}
            >
              {event.title}
            </div>
          )
        }}
      />

      {openedEvent && (
        <EventPopup
          top={popupPos.top}
          left={popupPos.left}
          width={popupPos.width}
          onClose={() => setOpenedEvent(null)}
        >
          <div
            className={`rounded-lg p-3 ${calendarStyleMap[openedEvent.status].popup}`}
          >
            <p className="text-pace-sm pb-2">강사 {openedEvent.speaker}</p>
            <p className="text-pace-sm pb-2">참가비 {openedEvent.fee}</p>
            <Button
              className={`mt-1 w-[87px] h-[22px] text-white text-xs font-light rounded-full mx-auto block p-0 text-center flex items-center justify-center transition-all duration-200 ${calendarStyleMap[openedEvent.status].button}`}
            >
              자세히 보기
            </Button>
          </div>
        </EventPopup>
      )}
    </div>
  );
}
