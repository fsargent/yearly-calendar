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

/** How to render days that are already over. */
export type PastDaysMode = "normal" | "dim" | "hide";

export const PAST_DAYS_MODES: PastDaysMode[] = ["normal", "dim", "hide"];

export const DEFAULT_PAST_DAYS_MODE: PastDaysMode = "dim";

export function isPastDaysMode(value: unknown): value is PastDaysMode {
  return (
    typeof value === "string" &&
    (PAST_DAYS_MODES as string[]).includes(value)
  );
}

export type PlannerDayEvent = {
  id: string;
  calendarId: CalendarId;
  title: string;
  color: { bg: string; fg: string };
};
