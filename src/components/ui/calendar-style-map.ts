// components/ui/calendar-style-map.ts

import type { CalendarEvent } from '@/components/features/workshops/workshop-calendar';

type CalendarStyle = {
  event: string;
  activeEvent: string;
  popup: string;
  button: string;
  text: string;
  border: string;
};

export const calendarStyleMap: Record<CalendarEvent['status'], CalendarStyle> =
  {
    OPEN: {
      event: 'border-orange/20 bg-orange/5 text-orange',
      activeEvent:
        'border-orange/20 border-b-transparent bg-[#fff8f6] text-orange',
      popup: 'border border-t-0 border-orange/20 bg-[#fff8f6] text-gray-500',
      button: 'bg-orange hover:bg-orange-hover',
      text: 'text-orange',
      border: 'border-orange'
    },
    CLOSED: {
      event: 'border-teal/20 bg-teal/5 text-teal',
      activeEvent: 'border-teal/20 border-b-transparent bg-[#f5fcfe] text-teal',
      popup: 'border border-t-0 border-teal/20 bg-[#f5fcfe] text-gray-500',
      button: 'bg-teal hover:bg-teal/90',
      text: 'text-teal',
      border: 'border-teal'
    },
    COMPLETED: {
      event: 'border-gray-200 bg-gray-100/70 text-gray-400',
      activeEvent:
        'border-gray-200 border-b-transparent bg-gray-50 text-gray-400',
      popup: 'border border-t-0 border-gray-200 bg-gray-50 text-gray-500',
      button: 'bg-gray-500 hover:bg-gray-600',
      text: 'text-gray-500',
      border: 'border-gray-500'
    }
  };
