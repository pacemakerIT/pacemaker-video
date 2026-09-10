export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  speaker: string;
  fee: string;
  status: 'OPEN' | 'CLOSED' | 'COMPLETED';
};
