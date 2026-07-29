function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function parseIsoDate(iso: string): {
  year: number;
  month: number;
  day: number;
} {
  // expects YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Invalid ISO date: ${iso}`);
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

export function formatIsoDate(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function addDaysIso(iso: string, days: number): string {
  const { year, month, day } = parseIsoDate(iso);
  const dt = new Date(Date.UTC(year, month - 1, day));
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatIsoDate(
    dt.getUTCFullYear(),
    dt.getUTCMonth() + 1,
    dt.getUTCDate(),
  );
}

export function isoToDayOfWeek(iso: string): number {
  // 0=Sun..6=Sat, in UTC
  const { year, month, day } = parseIsoDate(iso);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function daysInMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

/** Today in the browser's local time zone, as YYYY-MM-DD. */
export function todayIso(): string {
  const now = new Date();
  return formatIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Whole days from `fromIso` to `toIso`. Negative when `toIso` is earlier. */
export function daysBetweenIso(fromIso: string, toIso: string): number {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  const msA = Date.UTC(a.year, a.month - 1, a.day);
  const msB = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((msB - msA) / 86_400_000);
}
