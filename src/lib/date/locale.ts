export type WeekStartDay = 0 | 1 | 6; // Sunday | Monday | Saturday

/**
 * Regions that start the week on Sunday. Used only when the browser does not
 * expose Intl week info.
 */
const SUNDAY_FIRST = new Set([
  "AG", "AS", "AU", "BD", "BR", "BS", "BT", "BW", "BZ", "CA", "CN", "CO",
  "DM", "DO", "ET", "GT", "GU", "HK", "HN", "ID", "IL", "IN", "JM", "JP",
  "KE", "KH", "KR", "LA", "MH", "MM", "MO", "MT", "MX", "MZ", "NI", "NP",
  "PA", "PE", "PH", "PK", "PR", "PT", "PY", "SA", "SG", "SV", "TH", "TT",
  "TW", "UM", "US", "VE", "VI", "WS", "YE", "ZA", "ZW",
]);

/** Regions that start the week on Saturday. */
const SATURDAY_FIRST = new Set([
  "AE", "AF", "BH", "DJ", "DZ", "EG", "IQ", "IR", "JO", "KW", "LY", "OM",
  "QA", "SD", "SY",
]);

type WeekInfo = { firstDay: number };
type LocaleWithWeekInfo = Intl.Locale & {
  getWeekInfo?: () => WeekInfo;
  weekInfo?: WeekInfo;
};

/**
 * Week start for the browser locale. Reads Intl week info when the browser
 * has it, and falls back to a region list. Monday is the default, because
 * ISO 8601 and most of the world use it.
 */
export function localeWeekStart(): WeekStartDay {
  const tag =
    typeof navigator === "undefined" ? undefined : navigator.language;
  if (!tag) return 1;

  let locale: LocaleWithWeekInfo | null = null;
  try {
    locale = new Intl.Locale(tag) as LocaleWithWeekInfo;
  } catch {
    return 1;
  }

  // Intl week info numbers days 1=Monday .. 7=Sunday.
  let firstDay: number | undefined;
  try {
    firstDay = locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay;
  } catch {
    firstDay = undefined;
  }
  if (firstDay === 7) return 0;
  if (firstDay === 6) return 6;
  if (firstDay === 1) return 1;

  const region = regionOf(locale, tag);
  if (region && SUNDAY_FIRST.has(region)) return 0;
  if (region && SATURDAY_FIRST.has(region)) return 6;
  return 1;
}

function regionOf(locale: LocaleWithWeekInfo, tag: string): string | null {
  const fromLocale = locale.maximize?.().region ?? locale.region;
  if (fromLocale) return fromLocale.toUpperCase();

  const parts = tag.split("-");
  const guess = parts.find((p) => /^[A-Za-z]{2}$/.test(p) && p !== parts[0]);
  return guess ? guess.toUpperCase() : null;
}
