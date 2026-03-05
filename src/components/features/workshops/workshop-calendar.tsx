'use client';

import { MouseEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar, dateFnsLocalizer, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/components/features/workshops/calendar-custom.css';
import EventPopup from '@/components/features/workshops/event-popup';
import { Button } from '@/components/ui/button';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { calendarStyleMap } from '@/components/ui/calendar-style-map';

const locales = { 'en-US': enUS };

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

export type WorkshopFromApi = {
  title: string;
  startDate: string;
  endDate: string;
  price: number | null;
  status: string;
  instructor: { name: string | null } | null;
};

const monthMap: { [key: string]: string } = {
  January: '1월',
  February: '2월',
  March: '3월',
  April: '4월',
  May: '5월',
  June: '6월',
  July: '7월',
  August: '8월',
  September: '9월',
  October: '10월',
  November: '11월',
  December: '12월'
};

function get6MonthRange(center: Date) {
  const start = new Date(center.getFullYear(), center.getMonth() - 3, 1);
  const end = new Date(
    center.getFullYear(),
    center.getMonth() + 4,
    0,
    23,
    59,
    59
  );
  return { start, end };
}

function isInRange(date: Date, range: { start: Date; end: Date }) {
  return date >= range.start && date <= range.end;
}

function CustomToolbar({
  label,
  onNavigate,
  count
}: ToolbarProps<CalendarEvent> & { count: number }) {
  return (
    <div className="w-full flex items-center justify-between gap-4 flex-wrap py-4 pb-8">
      <button
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
        onClick={() => onNavigate('PREV')}
      >
        <Image
          src="/icons/calendar-arrow-left.svg"
          alt="prev"
          width={40}
          height={40}
        />
      </button>
      <div className="flex-1 text-center min-w-[200px] max-w-[600px] mx-auto">
        <h2 className="font-bold text-pace-xl text-pace-gray-700 pb-2">
          {label}
        </h2>
        <p className="text-pace-stone-500 text-pace-base truncate">
          {monthMap[label.split(' ')[0]]}에는{' '}
          <span className="text-pace-orange-600">{count}개</span>의 워크샵이
          있어요
        </p>
      </div>
      <button
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
        onClick={() => onNavigate('NEXT')}
      >
        <Image
          src="/icons/calendar-arrow-right.svg"
          alt="next"
          width={40}
          height={40}
        />
      </button>
    </div>
  );
}

export default function WorkshopCalendar({
  onMonthChange,
  onSelectWorkshop // 외부에서 워크숍 선택 시 처리할 함수
}: {
  onMonthChange?: (date: Date) => void;
  onSelectWorkshop?: (title: string) => void; // 워크숍 title (또는 id) 전달
}) {
  const [allWorkshops, setAllWorkshops] = useState<WorkshopFromApi[]>([]);
  const [loadedRange, setLoadedRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [count, setCount] = useState(0);
  const [openedEvent, setOpenedEvent] = useState<CalendarEvent | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });

  const filterWorkshopsByMonth = (date: Date, workshops: WorkshopFromApi[]) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const filtered = workshops.filter((w) => {
      const start = new Date(w.startDate);
      return start.getFullYear() === year && start.getMonth() === month;
    });

    const formatted = filtered.map((w) => ({
      title: w.title,
      start: new Date(w.startDate),
      end: new Date(w.endDate),
      speaker: w.instructor?.name ?? 'Unknown',
      fee: w.price ? `$${w.price.toLocaleString()}` : 'Free',
      status: w.status as CalendarEvent['status']
    }));

    setEvents(formatted);
    setCount(formatted.length);
  };

  const handleNavigate = async (newDate: Date) => {
    onMonthChange?.(newDate); // 새로 조회한 날짜 상위에 전달

    if (!loadedRange || !isInRange(newDate, loadedRange)) {
      const { start, end } = get6MonthRange(newDate);

      try {
        const res = await fetch(
          `/api/workshops?range=6months&center=${newDate.toISOString()}`
        );
        const text = await res.text();
        const json = text ? JSON.parse(text) : { workshops: [], count: 0 };

        const newWorkshops = json.workshops.filter(
          (newW: WorkshopFromApi) =>
            !allWorkshops.some(
              (w) => w.title === newW.title && w.startDate === newW.startDate
            )
        );

        const merged = [...allWorkshops, ...newWorkshops];
        setAllWorkshops(merged);
        setLoadedRange({ start, end });
        filterWorkshopsByMonth(newDate, merged);
      } catch (error) {
        toast(`Failed to fetch extended range: ${error}`);
      }
    } else {
      filterWorkshopsByMonth(newDate, allWorkshops);
    }
  };

  useEffect(() => {
    const today = new Date();
    const { start, end } = get6MonthRange(today);

    const fetchInitial = async () => {
      try {
        const res = await fetch(
          `/api/workshops?range=6months&center=${today.toISOString()}`
        );
        const text = await res.text();
        const json = text ? JSON.parse(text) : { workshops: [], count: 0 };
        setAllWorkshops(json.workshops);
        setLoadedRange({ start, end });
        filterWorkshopsByMonth(today, json.workshops);
        onMonthChange?.(today); // 초기 조회일도 전달
      } catch (error) {
        toast(`Failed to fetch initial data: ${error}`);
      }
    };

    fetchInitial();
  }, [onMonthChange]);

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

  return (
    <div
      className="w-[62.5%] max-w-[900px] items-center mx-auto justify-center flex flex-col gap-8 bg-white"
      onClick={() => setOpenedEvent(null)}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, width: '100%' }}
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
            {openedEvent.speaker &&
              openedEvent.speaker.toUpperCase() !== 'UNKNOWN' && (
                <p className="text-pace-sm pb-2">강사 {openedEvent.speaker}</p>
              )}
            <p className="text-pace-sm pb-2">참가비 {openedEvent.fee}</p>
            <Button
              onClick={() => {
                onSelectWorkshop?.(openedEvent.title); // 워크숍 title을 상위로 전달
                setOpenedEvent(null);
              }}
              className={`mt-1 w-[87px] h-[22px] text-white text-xs font-light rounded-full mx-auto block p-0 text-center flex items-center justify-center transition-all duration-200 ${calendarStyleMap[openedEvent.status].button}`}
            >
              View detail
            </Button>
          </div>
        </EventPopup>
      )}
    </div>
  );
}
