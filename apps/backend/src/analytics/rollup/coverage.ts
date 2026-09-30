/** Pure date helpers for the rollup watermark (UTC `YYYY-MM-DD` strings). */
const DAY_MS = 24 * 60 * 60 * 1000;

export const utcDay = (d: Date): string => d.toISOString().slice(0, 10);

export const addDays = (day: string, n: number): string => utcDay(new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS));

export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

export interface Coverage {
  coveredFrom: string | null;
  coveredThrough: string | null;
}

/**
 * Merge a finished run over `[from, to]` into the coverage window. Only *closed* days
 * (≤ yesterday relative to `today`) count as covered — today keeps changing. Contiguous or
 * overlapping ranges merge; a disjoint newer range replaces an older one (days that drop out
 * simply fall back to live aggregation).
 */
export function mergeCoverage(existing: Coverage, from: string, to: string, today: string): Coverage {
  const yesterday = addDays(today, -1);
  const closedEnd = to < yesterday ? to : yesterday;
  if (closedEnd < from) {
    return existing;
  }
  const { coveredFrom: cf, coveredThrough: ct } = existing;
  if (cf === null || ct === null) {
    return { coveredFrom: from, coveredThrough: closedEnd };
  }
  const touches = from <= addDays(ct, 1) && closedEnd >= addDays(cf, -1);
  if (touches) {
    return { coveredFrom: from < cf ? from : cf, coveredThrough: closedEnd > ct ? closedEnd : ct };
  }
  return closedEnd > ct ? { coveredFrom: from, coveredThrough: closedEnd } : existing;
}
