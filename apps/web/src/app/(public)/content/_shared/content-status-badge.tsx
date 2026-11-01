import { cn } from "@/app/_libs/utils/cn";

/** Lifecycle states, plus "boosted" — an overlay pill shown *alongside* the lifecycle
 *  status (a boosted video is still published or scheduled at the same time). */
export type ContentStatus =
  | "draft"
  | "ready"
  | "published"
  | "scheduled"
  | "boosted"
  | "rejected"
  | "pending"
  | "archived";

interface ContentStatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const statusConfig: Record<ContentStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  ready: {
    label: "Ready",
    className: "bg-primary/20 text-primary",
  },
  published: {
    label: "Published",
    className: "bg-success/20 text-success",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-info/20 text-info",
  },
  boosted: {
    label: "Boosted",
    className: "bg-featured/20 text-featured live-pulse",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/20 text-destructive",
  },
  pending: {
    label: "Pending Review",
    className: "bg-warning/20 text-warning",
  },
  archived: {
    label: "Archived",
    className: "bg-muted/50 text-muted-foreground",
  },
};

/** Content lifecycle pill (content-specific colours; the app-wide `StatusBadge` is outlined). */
export function ContentStatusBadge({ status, className }: ContentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}>
      {config.label}
    </span>
  );
}
