export type GoogleCalendarListEntry = {
  id: string;
  summary?: string;
  primary?: boolean;
  selected?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: "none" | "freeBusyReader" | "reader" | "writer" | "owner";
};

export type GoogleCalendarListResponse = {
  items?: GoogleCalendarListEntry[];
};

export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  colorId?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  creator?: { email?: string; displayName?: string };
  organizer?: { email?: string; displayName?: string };
};

export type GoogleEventsListResponse = {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
};

function assertOk(res: Response): void {
  if (res.ok) return;
  throw new Error(`Google API error: ${res.status} ${res.statusText}`);
}

async function googleGet<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  assertOk(res);
  return (await res.json()) as T;
}

export async function listCalendars(
  accessToken: string,
): Promise<GoogleCalendarListEntry[]> {
  const data = await googleGet<GoogleCalendarListResponse>(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    accessToken,
  );
  return data.items ?? [];
}

export async function listAllDayEventsForYear(opts: {
  accessToken: string;
  calendarId: string;
  year: number;
}): Promise<GoogleCalendarEvent[]> {
  const { accessToken, calendarId, year } = opts;
  const timeMin = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
  const timeMax = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0)).toISOString();

  const all: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined = undefined;

  // Google Calendar API maxResults tops out at 2500 for events.list
  for (;;) {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    );
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "2500");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const data = await googleGet<GoogleEventsListResponse>(
      url.toString(),
      accessToken,
    );
    const items = data.items ?? [];

    for (const ev of items) {
      // all-day events come back as { start: { date }, end: { date } }
      if (ev.start?.date && ev.end?.date) all.push(ev);
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return all;
}
