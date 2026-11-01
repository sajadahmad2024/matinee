import { format, isValid, parseISO } from "date-fns";

import { formatCurrency } from "@/app/_libs/utils/math";

/** App-wide value formatters for API data. Every one takes nullish input and returns `EMPTY`. */

/** Shown for any value the API doesn't have. */
export const EMPTY = "—";

/**
 * An API timestamp as a `Date`. Most are ISO, but some raw-SQL fields (e.g. `scheduledAt`) come back
 * Postgres-style ("2026-11-25 13:00:00+00"), which `new Date()` can't read in Safari. `parseISO`
 * reads both; anything else is `undefined`.
 */
export const parseApiDate = (iso?: string | null) => {
  const date = iso ? parseISO(iso) : undefined;
  return date && isValid(date) ? date : undefined;
};

/** An API timestamp in a `date-fns` pattern, or the empty dash — never throws on a bad value. */
const formatApiDate = (iso: string | null | undefined, pattern: string) => {
  const date = parseApiDate(iso);
  return date ? format(date, pattern) : EMPTY;
};

/** "Oct 20, 2026". */
export const formatDate = (iso?: string | null) => formatApiDate(iso, "MMM d, yyyy");

/** "Oct 20". */
export const formatShortDate = (iso?: string | null) => formatApiDate(iso, "MMM d");

/** "Oct 20, 2026 · 8:00 PM" — in the viewer's local time. */
export const formatDateTime = (iso?: string | null) => formatApiDate(iso, "MMM d, yyyy · h:mm a");

/** "Oct 20, 2026 · 20:00" — 24-hour, in the viewer's local time. */
export const formatDateTime24 = (iso?: string | null) => formatApiDate(iso, "MMM d, yyyy · HH:mm");

/**
 * "Oct 20, 2026 → Jan 5, 2027" (`short`: "Oct 20 → Jan 5"; `withTime` adds a 24-hour time:
 * "Oct 20, 20:00 → Jan 5, 23:59"); either end may be open.
 */
export const formatDateRange = (
  from?: string | null,
  to?: string | null,
  { short = false, withTime = false }: { short?: boolean; withTime?: boolean } = {},
) => {
  if (!from && !to) return EMPTY;
  const pattern = `${short ? "MMM d" : "MMM d, yyyy"}${withTime ? ", HH:mm" : ""}`;
  return `${formatApiDate(from, pattern)} → ${formatApiDate(to, pattern)}`;
};

/** API amounts are in cents. */
export const formatCents = (cents?: number | null, currency = "USD") =>
  cents == null ? EMPTY : formatCurrency(cents / 100, currency);

/** 1250 → "1.3K", 2_400_000 → "2.4M". */
export const formatCount = (n?: number | null) => {
  if (n == null) return EMPTY;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

/** 38.94 → "38.9%" (0..100 percentages). */
export const formatPct = (pct?: number | null) =>
  pct == null ? EMPTY : `${Math.round(pct * 10) / 10}%`;

/** 0.124 → "12.4%" (the API's 0..1 ratios). */
export const formatRatioPct = (ratio?: number | null) =>
  ratio == null ? EMPTY : formatPct(ratio * 100);

/** 125 → "2:05", 3725 → "1:02:05". */
export const formatDuration = (seconds?: number | null) => {
  if (seconds == null) return EMPTY;
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};
