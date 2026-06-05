import { cn } from "@/app/_libs/utils/cn";

export type ContentStatus =
  | "draft"
  | "ready"
  | "published"
  | "scheduled"
  | "boosted"
  | "rejected"
  | "pending";

interface StatusBadgeProps {
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
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
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

// Live Badge
export function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-live live-pulse inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold text-white uppercase",
        className,
      )}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      Live
    </span>
  );
}

// Featured Badge
export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-featured inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white uppercase",
        className,
      )}>
      Featured
    </span>
  );
}
