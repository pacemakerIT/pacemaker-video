// components/ui/calendar-style-map.ts

import type { CalendarEvent } from '@/components/calendar/workshop-calendar';

type CalendarStyle = {
  event: string;
  popup: string;
  button: string;
  text: string;
  border: string;
};

export const calendarStyleMap: Record<CalendarEvent['status'], CalendarStyle> =
  {
    RECRUITING: {
      event: 'bg-pace-orange-50 text-pace-orange-500',
      popup: 'bg-pace-orange-50 text-pace-orange-500',
      button: 'bg-pace-orange-600 hover:bg-pace-orange-900',
      text: 'text-pace-orange-500',
      border: 'border-pace-orange-500'
    },
    CLOSED: {
      event: 'bg-pace-stone-200 text-pace-stone-800',
      popup: 'bg-pace-stone-200 text-pace-stone-800',
      button: 'bg-pace-stone-500 hover:bg-pace-stone-800',
      text: 'text-pace-stone-800',
      border: 'border-pace-stone-800'
    },
    ONGOING: {
      event: 'bg-pace-mint-500/10 text-pace-mint-500',
      popup: 'bg-pace-mint-50 text-pace-mint-500',
      button: 'bg-pace-mint-500 hover:bg-pace-mint-500',
      text: 'text-pace-mint-500',
      border: 'border-pace-mint-500'
    },
    COMPLETED: {
      event: 'bg-pace-stone-200 text-pace-stone-800',
      popup: 'bg-pace-stone-200 text-pace-stone-800',
      button: 'bg-pace-stone-500 hover:bg-pace-stone-800',
      text: 'text-pace-stone-800',
      border: 'border-pace-stone-800'
    }
  };
