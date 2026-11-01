import { format } from "date-fns";

import { EMPTY, parseApiDate } from "@/app/_libs/utils/format";

/** Content-specific formatters; the generic ones live in `@/app/_libs/utils/format`. */

export {
  EMPTY,
  formatCents,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatShortDate,
  parseApiDate,
} from "@/app/_libs/utils/format";

/** "Oct 20, 2026 20:00" — the list card's compact date + time. */
export const formatScheduledAt = (iso?: string | null) => {
  const date = parseApiDate(iso);
  return date ? format(date, "MMM d, yyyy HH:mm") : EMPTY;
};

/**
 * English locales tried in turn: each only knows its own region's abbreviations (`en-US` gives
 * "EST" but "GMT+5:30" for India; `en-IN` gives "IST").
 */
const ZONE_NAME_FORMATTERS = [
  "en-US",
  "en-GB",
  "en-IN",
  "en-AU",
  "en-SG",
  "en-AE",
  "en-CA",
  "en-NZ",
  "en-ZA",
  "en-HK",
].map((locale) => new Intl.DateTimeFormat(locale, { timeZoneName: "short" }));

/**
 * The viewer's timezone on `date` as its abbreviation — "IST", "EDT", "CET", "SGT" (daylight saving
 * included) — or "UTC+09:00" for zones English has no abbreviation for.
 */
export const localZoneLabel = (date = new Date()) => {
  for (const formatter of ZONE_NAME_FORMATTERS) {
    const name = formatter.formatToParts(date).find((part) => part.type === "timeZoneName")?.value;
    if (name && /^[A-Z]{2,5}$/.test(name)) return name;
  }
  return format(date, "'UTC'xxx");
};

/** "Nov 25, 2026 · 6:30 PM IST" — a go-live time, where the zone matters most. */
export const formatGoLive = (iso?: string | null) => {
  const date = parseApiDate(iso);
  return date ? `${format(date, "MMM d, yyyy · h:mm a")} ${localZoneLabel(date)}` : EMPTY;
};
