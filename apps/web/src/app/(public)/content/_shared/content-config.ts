import type { Route } from "next";

/** Page-level static config for `/content`, shared by every section. */

// ─── Routes ──────────────────────────────────────────────────────────────────

export const CONTENT_ROUTES = {
  LIST: "/content" as Route,
  NEW: "/content/new" as Route,
  TAXONOMY: "/content/taxonomy" as Route,
  details: (id: string) => `/content/details/${id}` as Route,
  edit: (id: string) => `/content/edit/${id}` as Route,
  analytics: (id: string) => `/content/analytics/${id}` as Route,
} as const;

// ─── Lifecycle ───────────────────────────────────────────────────────────────

/** Backend lifecycle statuses (`ContentResponseDto.status` is typed as a plain string). */
export const ContentLifecycleStatus = {
  Draft: "draft",
  PendingApproval: "pending_approval",
  Scheduled: "scheduled",
  Published: "published",
  Rejected: "rejected",
  Archived: "archived",
} as const;
export type ContentLifecycleStatus =
  (typeof ContentLifecycleStatus)[keyof typeof ContentLifecycleStatus];

/**
 * Never been live, so there's no audience to measure — the analytics links are hidden. Rejected
 * belongs here too: only a video awaiting review can be rejected.
 */
const NEVER_LIVE_STATUSES = new Set<string>([
  ContentLifecycleStatus.Draft,
  ContentLifecycleStatus.PendingApproval,
  ContentLifecycleStatus.Scheduled,
  ContentLifecycleStatus.Rejected,
]);

export const hasAnalytics = (status?: string) => !!status && !NEVER_LIVE_STATUSES.has(status);

// ─── Permissions ─────────────────────────────────────────────────────────────

export const CONTENT_PERMISSIONS = {
  /** Schedule and Publish approve the video, skipping review. */
  Publish: "content:publish",
} as const;

// ─── Sections ────────────────────────────────────────────────────────────────

/** Summary-card sections (`?section=`). `None` collapses every card. */
export const ContentSection = {
  Inventory: "inventory",
  Licensing: "licensing",
  Performance: "performance",
  None: "none",
} as const;
export type ContentSection = (typeof ContentSection)[keyof typeof ContentSection];

// ─── Page URL defaults ───────────────────────────────────────────────────────

/** Page-level `?section=` / `?country=` defaults. Listing filters have their own in `listing-config`. */
export const CONTENT_PAGE_DEFAULTS = {
  section: ContentSection.Inventory,
} as const;
