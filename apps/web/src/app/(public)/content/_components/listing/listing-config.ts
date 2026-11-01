import { differenceInCalendarDays, startOfDay, subDays } from "date-fns";
import {
  Archive,
  Calendar,
  CalendarRange,
  FilePen,
  Film,
  Inbox,
  type LucideIcon,
  XCircle,
} from "lucide-react";

import { AdminContentControllerListV1SortEnum as ContentSortEnum } from "@/app/_libs/api/generated";
import type { ContentResponseDto } from "@/app/_libs/hooks/api/use-admin-content";
import type { CustomSelectOption } from "@/components/custom/custom-select";

import { ContentLifecycleStatus } from "../../_shared/content-config";
import { parseApiDate } from "../../_shared/content-format";
import type { ContentStatus } from "../../_shared/content-status-badge";

/**
 * Static config for the content listing: tabs, filter options, URL defaults, the tab → status
 * mapping, copy, and the API row → card mapping. UI sort values are the API's sort enum, so they
 * pass straight through.
 */

// ─── Tabs & view ─────────────────────────────────────────────────────────────

/** List tabs (`?tab=`): Drafts → Requests → Master → Scheduled → Live → Rejected → Archive. */
export const ContentTab = {
  Drafts: "drafts",
  Requests: "requests",
  Master: "master",
  Scheduled: "scheduled",
  Live: "all",
  Rejected: "rejected",
  Archived: "archived",
} as const;
export type ContentTab = (typeof ContentTab)[keyof typeof ContentTab];

export const CONTENT_TABS_CONFIG: { value: ContentTab; label: string; icon: LucideIcon }[] = [
  { value: ContentTab.Drafts, label: "Drafts", icon: FilePen },
  { value: ContentTab.Requests, label: "Requests", icon: Inbox },
  { value: ContentTab.Master, label: "Master", icon: CalendarRange },
  { value: ContentTab.Scheduled, label: "Scheduled", icon: Calendar },
  { value: ContentTab.Live, label: "Live", icon: Film },
  { value: ContentTab.Rejected, label: "Rejected", icon: XCircle },
  { value: ContentTab.Archived, label: "Archive", icon: Archive },
];

/** Master-tab layout (`?viewMode=`). */
export const ContentViewMode = {
  List: "list",
  Calendar: "calendar",
} as const;
export type ContentViewMode = (typeof ContentViewMode)[keyof typeof ContentViewMode];

/** Backend lifecycle statuses listed under each tab. */
export const TAB_STATUSES: Record<ContentTab, ContentLifecycleStatus[]> = {
  [ContentTab.Drafts]: [ContentLifecycleStatus.Draft],
  [ContentTab.Requests]: [ContentLifecycleStatus.PendingApproval],
  [ContentTab.Master]: [ContentLifecycleStatus.Published, ContentLifecycleStatus.Scheduled],
  [ContentTab.Scheduled]: [ContentLifecycleStatus.Scheduled],
  [ContentTab.Live]: [ContentLifecycleStatus.Published],
  [ContentTab.Rejected]: [ContentLifecycleStatus.Rejected],
  [ContentTab.Archived]: [ContentLifecycleStatus.Archived],
};

// ─── Sort ────────────────────────────────────────────────────────────────────

export type ContentSort = (typeof CONTENT_SORT_OPTIONS)[number]["value"];

export const CONTENT_SORT_OPTIONS = [
  { value: ContentSortEnum.Newest, label: "Newest" },
  { value: ContentSortEnum.MostViewed, label: "Most viewed" },
  { value: ContentSortEnum.LeastViewed, label: "Least viewed" },
] as const satisfies readonly CustomSelectOption[];

/** "Newest" on Master leads with what's coming up: scheduled ascending, then newest uploads. */
export const MASTER_NEWEST_SORT = ContentSortEnum.ScheduledAsc;

// ─── Upload-date range ───────────────────────────────────────────────────────

/** Upload-date filter (`?range=`). */
export const ContentDateRange = {
  Last30Days: "30d",
  Last90Days: "90d",
  AllTime: "all",
} as const;
export type ContentDateRange = (typeof ContentDateRange)[keyof typeof ContentDateRange];

export const DATE_RANGE_OPTIONS = [
  { value: ContentDateRange.Last30Days, label: "Last 30 days" },
  { value: ContentDateRange.Last90Days, label: "Last 90 days" },
  { value: ContentDateRange.AllTime, label: "All time" },
] as const satisfies readonly CustomSelectOption<ContentDateRange>[];

/** Look-back window for each range; "All time" sends no `createdFrom`. */
export const DATE_RANGE_DAYS: Record<
  Exclude<ContentDateRange, typeof ContentDateRange.AllTime>,
  number
> = {
  [ContentDateRange.Last30Days]: 30,
  [ContentDateRange.Last90Days]: 90,
};

/** The range's `createdFrom` (local midnight N days ago, as ISO); "All time" sends none. Computed per call. */
export const createdFromForRange = (range: ContentDateRange) =>
  range === ContentDateRange.AllTime
    ? undefined
    : subDays(startOfDay(new Date()), DATE_RANGE_DAYS[range]).toISOString();

// ─── URL defaults & paging ───────────────────────────────────────────────────

/** Values used when the query string omits a key; filter changes drop the key at its default. */
export const CONTENT_LIST_DEFAULTS = {
  tab: ContentTab.Master,
  viewMode: ContentViewMode.List,
  sort: ContentSortEnum.Newest,
  range: ContentDateRange.AllTime,
  page: 1,
  pageSize: 10,
} as const satisfies {
  tab: ContentTab;
  viewMode: ContentViewMode;
  sort: ContentSort;
  range: ContentDateRange;
  page: number;
  pageSize: number;
};

/** Master-tab calendar view (scheduled publishes + licence expiries on one month grid). */
export const CONTENT_CALENDAR_ENABLED = true;

export const CONTENT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const CONTENT_SEARCH_DEBOUNCE_MS = 500;

/** Placeholder cards shown on first load. */
export const CONTENT_LIST_SKELETON_COUNT = 3;

// ─── Copy ────────────────────────────────────────────────────────────────────

export const CONTENT_LIST_COPY = {
  searchPlaceholder: "Search videos...",
  errorTitle: "Unable to load videos",
  errorFallback: "Please try again.",
  emptyTitle: "No videos found",
} as const;

// ─── API row helpers ─────────────────────────────────────────────────────────

/** A list row as the API returns it — the card and its signals read this directly. */
export type ContentRow = ContentResponseDto;

/** Backend lifecycle status → `ContentStatusBadge`'s key (`pending_approval` → "pending"). */
const BADGE_STATUS: Record<ContentLifecycleStatus, ContentStatus> = {
  [ContentLifecycleStatus.Draft]: "draft",
  [ContentLifecycleStatus.PendingApproval]: "pending",
  [ContentLifecycleStatus.Scheduled]: "scheduled",
  [ContentLifecycleStatus.Published]: "published",
  [ContentLifecycleStatus.Rejected]: "rejected",
  [ContentLifecycleStatus.Archived]: "archived",
};

export const toBadgeStatus = (status?: string): ContentStatus =>
  BADGE_STATUS[status as ContentLifecycleStatus] ?? "draft";

export const isPendingApproval = (row: ContentRow) =>
  row?.status === ContentLifecycleStatus.PendingApproval;

/** A draft has no audience yet — the card hides what's measured on viewers. */
export const isDraft = (row: ContentRow) => row?.status === ContentLifecycleStatus.Draft;

export const isBoosted = (row: ContentRow) => row?.isBoostActive ?? row?.isBoosted;

export const isSponsored = (row: ContentRow) => !!(row?.sponsored ?? row?.isSponsored);

export type LicenseStatus = "original" | "licensed" | "expiring" | "expired";
const LICENSE_STATUSES = new Set<string>(["original", "licensed", "expiring", "expired"]);

/** `licenseStatus` is a plain string in the SDK; only known values reach the chip. */
export const licenseStatusOf = (row: ContentRow): LicenseStatus | undefined =>
  row?.licenseStatus && LICENSE_STATUSES.has(row?.licenseStatus)
    ? (row?.licenseStatus as LicenseStatus)
    : undefined;

/** Whole days until the licence expires (negative once lapsed). */
export const licenseDaysLeft = (row: ContentRow) => {
  const expiresAt = parseApiDate(row?.licenseExpiresAt);
  return expiresAt ? differenceInCalendarDays(expiresAt, new Date()) : undefined;
};

export type Recommendation = "promoted" | "normal" | "deprioritized";
const RECOMMENDATIONS = new Set<string>(["promoted", "normal", "deprioritized"]);

export const recommendationOf = (row: ContentRow): Recommendation | undefined =>
  row?.recommendation && RECOMMENDATIONS.has(row?.recommendation)
    ? (row?.recommendation as Recommendation)
    : undefined;

// moved to the shared formatters (games uses it too); re-exported for the content imports
export { formatDuration } from "@/app/_libs/utils/format";

/** 1250 → "1.3K", 2_400_000 → "2.4M". */
export const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};
