'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import EventPopup from '@/components/features/workshops/event-popup';
import { Button } from '@/components/ui/button';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { calendarStyleMap } from '@/components/ui/calendar-style-map';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  instructors: { instructor: { name: string } }[];
};

const monthMap: { [key: string]: string } = {
  January: 'January',
  February: 'February',
  March: 'March',
  April: 'April',
  May: 'May',
  June: 'June',
  July: 'July',
  August: 'August',
  September: 'September',
  October: 'October',
  November: 'November',
  December: 'December'
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
  const monthName = label.split(' ')[0];

  return (
    <div className="mb-4 flex w-full items-center justify-between px-2">
      <button
        className="flex h-[56px] w-[56px] items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#00263B]"
        onClick={() => onNavigate('PREV')}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="text-center">
        <h2 className="font-headline text-[24px] font-bold leading-[36px] text-[#00263B]">
          {label.split(' ')[0].slice(0, 3) + ', ' + label.split(' ')[1]}
        </h2>
        <p className="mt-1 text-[16px] font-bold text-[#666666]">
          <span className="text-[#FF4F02]">{count}</span> Workshops in{' '}
          {monthMap[monthName]}
        </p>
      </div>
      <button
        className="flex h-[56px] w-[56px] items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#00263B]"
        onClick={() => onNavigate('NEXT')}
        aria-label="Next month"
      >
        <ChevronRight className="h-6 w-6" />
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
  const [calendarDate, setCalendarDate] = useState(() => new Date());
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
      speaker: w.instructors[0]?.instructor?.name ?? 'Unknown',
      fee: w.price ? `$${w.price.toLocaleString()}` : 'Free',
      status: w.status as CalendarEvent['status']
    }));

    setEvents(formatted);
    setCount(formatted.length);
  };

  const handleNavigate = async (newDate: Date) => {
    setCalendarDate(newDate);
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
        setCalendarDate(today);
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
      className="mb-8 flex w-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,38,59,0.04)] md:h-[778px]"
      onClick={() => setOpenedEvent(null)}
    >
      <Calendar
        localizer={localizer}
        events={events}
        date={calendarDate}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 680, width: '100%' }}
        views={['month']}
        onNavigate={handleNavigate}
        components={{
          toolbar: (props) => <CustomToolbar {...props} count={count} />,
          event: ({ event }) => (
            <div
              onClick={(e) => handleEventClick(e, event)}
              className={`${openedEvent ? 'rounded-t' : 'rounded'} flex max-w-full cursor-pointer items-center justify-center truncate border px-1 py-0.5 text-[11px] font-bold transition-all duration-200 hover:scale-[1.02] md:px-1.5 md:text-[14px] ${calendarStyleMap[event.status].event}`}
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
            className={`rounded-b-lg p-3 ${calendarStyleMap[openedEvent.status].popup}`}
          >
            {openedEvent.speaker &&
              openedEvent.speaker.toUpperCase() !== 'UNKNOWN' && (
                <p className="text-pace-sm pb-2">
                  Instructor: {openedEvent.speaker}
                </p>
              )}
            <p className="text-pace-sm pb-2">Fee: {openedEvent.fee}</p>
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
