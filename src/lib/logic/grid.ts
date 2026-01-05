import {
  addDaysIso,
  daysInMonth,
  formatIsoDate,
  parseIsoDate,
} from "$lib/date/iso";
import type { PlannerAllDayEvent } from "$lib/types/planner";

export type MonthBar = {
  id: string;
  title: string;
  bg: string;
  fg: string;
  colStart: number; // grid column line (1-based)
  colEnd: number; // grid column line (exclusive)
  lane: number; // 0-based
  event: PlannerAllDayEvent;
};

export function isWeekend(dow: number): boolean {
  return dow === 0 || dow === 6;
}

export function intersectsMonth(
  ev: PlannerAllDayEvent,
  year: number,
  month1to12: number,
): boolean {
  const s = parseIsoDate(ev.startDate);
  const e = parseIsoDate(ev.endDateExclusive);
  const monthStart = new Date(Date.UTC(year, month1to12 - 1, 1));
  const monthEndExclusive = new Date(Date.UTC(year, month1to12, 1));
  const start = new Date(Date.UTC(s.year, s.month - 1, s.day));
  const endEx = new Date(Date.UTC(e.year, e.month - 1, e.day));
  return start < monthEndExclusive && endEx > monthStart;
}

export function intersectsWeek(
  ev: PlannerAllDayEvent,
  weekStartIso: string,
): boolean {
  const weekEndExIso = addDaysIso(weekStartIso, 7);
  return ev.startDate < weekEndExIso && ev.endDateExclusive > weekStartIso;
}

export function clampEventToMonth(
  ev: PlannerAllDayEvent,
  year: number,
  month1to12: number,
): { startDay: number; endDayExclusive: number } | null {
  if (!ev.startDate || !ev.endDateExclusive) return null;
  const dim = daysInMonth(year, month1to12);
  const monthStartIso = formatIsoDate(year, month1to12, 1);
  const monthEndExIso = formatIsoDate(year, month1to12, dim + 1); // not a real date, but used for comparisons below

  // Compare as ISO strings (safe for YYYY-MM-DD)
  const startIso = ev.startDate < monthStartIso ? monthStartIso : ev.startDate;
  const endIso =
    ev.endDateExclusive > monthEndExIso ? monthEndExIso : ev.endDateExclusive;

  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (start.month !== month1to12 && startIso !== monthStartIso) return null;
  if (end.month !== month1to12 && endIso !== monthEndExIso) return null;

  const startDay = startIso === monthStartIso ? 1 : start.day;
  const endDayExclusive = endIso === monthEndExIso ? dim + 1 : end.day;
  if (endDayExclusive <= startDay) return null;
  return { startDay, endDayExclusive };
}

export function clampEventToWeek(
  ev: PlannerAllDayEvent,
  weekStartIso: string,
): { startIdx: number; endIdxExclusive: number } | null {
  const weekEndExIso = addDaysIso(weekStartIso, 7);

  const startIso = ev.startDate < weekStartIso ? weekStartIso : ev.startDate;
  const endIso =
    ev.endDateExclusive > weekEndExIso ? weekEndExIso : ev.endDateExclusive;

  if (endIso <= startIso) return null;

  // Calculate 0-based index from weekStart
  const startDiff =
    (new Date(startIso).getTime() - new Date(weekStartIso).getTime()) /
    86400000;
  const endDiff =
    (new Date(endIso).getTime() - new Date(weekStartIso).getTime()) / 86400000;

  return {
    startIdx: Math.round(startDiff),
    endIdxExclusive: Math.round(endDiff),
  };
}

export function lanePack(bars: Array<Omit<MonthBar, "lane">>): MonthBar[] {
  const lanesEnd: number[] = [];
  const out: MonthBar[] = [];
  for (const b of bars) {
    let lane = 0;
    for (; lane < lanesEnd.length; lane++) {
      if (b.colStart >= lanesEnd[lane]) break;
    }
    if (lane === lanesEnd.length) lanesEnd.push(b.colEnd);
    else lanesEnd[lane] = b.colEnd;
    out.push({ ...b, lane });
  }
  return out;
}

export function barBackground(ev: PlannerAllDayEvent): string {
  const sources = ev.sources ?? [];
  if (sources.length <= 1) return ev.color.bg;

  const parts: string[] = [];
  const n = sources.length;
  for (let i = 0; i < n; i++) {
    const from = Math.round((i / n) * 1000) / 10;
    const to = Math.round(((i + 1) / n) * 1000) / 10;
    parts.push(`${sources[i].color.bg} ${from}% ${to}%`);
  }
  return `linear-gradient(90deg, ${parts.join(", ")})`;
}

export function endInclusive(ev: PlannerAllDayEvent): string {
  return addDaysIso(ev.endDateExclusive, -1);
}
