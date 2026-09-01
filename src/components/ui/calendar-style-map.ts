// components/ui/calendar-style-map.ts

import { WorkshopStatus } from '@/types/workshops';

export type CalendarStyle = {
  event: string;
  popup: string;
  button: string;
  text: string;
  border: string;
};

export const calendarStyleMap: Record<WorkshopStatus, CalendarStyle> = {
  OPEN: {
    event: 'border-orange/20 bg-orange/5 text-orange',
    popup: 'border-orange/20 bg-[#fff8f6] text-orange',
    button: 'bg-orange hover:bg-orange-hover',
    text: 'text-orange',
    border: 'border-orange'
  },
  CLOSED: {
    event: 'border-teal/20 bg-teal/5 text-teal',
    popup: 'border-teal/20 bg-[#f5fcfe] text-teal',
    button: 'bg-teal hover:bg-teal/90',
    text: 'text-teal',
    border: 'border-teal'
  },
  COMPLETED: {
    event: 'border-gray-200 bg-gray-50 text-gray-500',
    popup: 'border-gray-200 bg-gray-50 text-gray-500',
    button: 'bg-gray-500 hover:bg-gray-600',
    text: 'text-gray-500',
    border: 'border-gray-500'
  }
};

export function getCalendarStyle(status: WorkshopStatus): CalendarStyle {
  return calendarStyleMap[status];
}
