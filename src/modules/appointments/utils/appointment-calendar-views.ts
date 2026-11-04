export const CALENDAR_VIEWS = [
  "timeGridDay",
  "timeGridWeek",
  "dayGridMonth",
] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];
