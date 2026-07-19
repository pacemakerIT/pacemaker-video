// components/ui/calendar-style-map.ts

export type CalendarStyle = {
  event: string;
  popup: string;
  button: string;
  text: string;
  border: string;
};

const fallbackStyle: CalendarStyle = {
  event: 'border-gray-200 bg-gray-100/70 text-gray-500',
  popup: 'border-gray-200 bg-gray-100 text-gray-600',
  button: 'bg-gray-500 hover:bg-gray-600',
  text: 'text-gray-500',
  border: 'border-gray-300'
};

export const calendarStyleMap: Record<string, CalendarStyle> = {
  OPEN: {
    event: 'border-[#FF4F02]/20 bg-[#FF4F02]/10 text-[#FF4F02]',
    popup: 'border-[#FF4F02]/20 bg-[#FFF3EC] text-[#FF4F02]',
    button: 'bg-[#FF4F02] hover:bg-[#E04400]',
    text: 'text-[#FF4F02]',
    border: 'border-[#FF4F02]'
  },
  RECRUITING: {
    event: 'border-[#FF4F02]/20 bg-[#FF4F02]/10 text-[#FF4F02]',
    popup: 'border-[#FF4F02]/20 bg-[#FFF3EC] text-[#FF4F02]',
    button: 'bg-[#FF4F02] hover:bg-[#E04400]',
    text: 'text-[#FF4F02]',
    border: 'border-[#FF4F02]'
  },
  CLOSED: {
    event: 'border-teal-500/20 bg-teal-50 text-teal-600',
    popup: 'border-teal-500/20 bg-teal-50 text-teal-700',
    button: 'bg-teal-600 hover:bg-teal-700',
    text: 'text-teal-600',
    border: 'border-teal-600'
  },
  ONGOING: {
    event: 'bg-pace-orange-50 text-pace-orange-500',
    popup: 'bg-pace-orange-50 text-pace-orange-500',
    button: 'bg-pace-orange-600 hover:bg-pace-orange-900',
    text: 'text-pace-orange-500',
    border: 'border-pace-orange-500'
  },
  COMPLETED: fallbackStyle
};

export function getCalendarStyle(status: string): CalendarStyle {
  return calendarStyleMap[status] ?? fallbackStyle;
}
