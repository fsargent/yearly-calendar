export type CalendarId = string;

export type PlannerEventSource = {
  calendarId: CalendarId;
  color: { bg: string; fg: string };
};

export type PlannerCalendar = {
  id: CalendarId;
  title: string;
  backgroundColor: string;
  foregroundColor: string;
  primary: boolean;
};

export type PlannerAllDayEvent = {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD (inclusive)
  endDateExclusive: string; // YYYY-MM-DD (exclusive)
  // primary calendar/color used for text + default rendering
  calendarId: CalendarId;
  color: { bg: string; fg: string };
  // additional sources when the event is duplicated across calendars
  sources: PlannerEventSource[];
  description?: string;
  location?: string;
  htmlLink?: string;
};

export type PlannerDayEvent = {
  id: string;
  calendarId: CalendarId;
  title: string;
  color: { bg: string; fg: string };
};
