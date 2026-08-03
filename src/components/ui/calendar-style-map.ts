// components/ui/calendar-style-map.ts

import type { CalendarEvent } from '@/components/features/workshops/workshop-calendar';

type CalendarStyle = {
  event: string;
  popup: string;
  button: string;
  text: string;
  border: string;
};

export const calendarStyleMap: Record<CalendarEvent['status'], CalendarStyle> =
  {
    OPEN: {
      event: 'bg-navy/10 text-navy',
      popup: 'bg-navy/10 text-navy',
      button: 'bg-navy hover:bg-navy/90',
      text: 'text-navy',
      border: 'border-navy'
    },
    CLOSED: {
      event: 'bg-pace-stone-200 text-pace-stone-800',
      popup: 'bg-pace-stone-200 text-pace-stone-800',
      button: 'bg-pace-stone-500 hover:bg-pace-stone-800',
      text: 'text-pace-stone-800',
      border: 'border-pace-stone-800'
    },
    COMPLETED: {
      event: 'bg-pace-stone-200 text-pace-stone-800',
      popup: 'bg-pace-stone-200 text-pace-stone-800',
      button: 'bg-pace-stone-500 hover:bg-pace-stone-800',
      text: 'text-pace-stone-800',
      border: 'border-pace-stone-800'
    }
  };
