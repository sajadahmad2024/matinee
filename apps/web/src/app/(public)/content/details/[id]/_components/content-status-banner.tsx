import * as React from "react";

import { CalendarClock, Clock, XCircle } from "lucide-react";

import type { ContentResponseDto } from "@/app/_libs/hooks/api/use-admin-content";
import { cn } from "@/app/_libs/utils/cn";

import { ContentLifecycleStatus } from "../../../_shared/content-config";
import { formatGoLive } from "../../../_shared/content-format";

export interface ContentStatusBannerProps {
  content: ContentResponseDto;
  className?: string;
}

const TONES = {
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  primary: "border-primary/30 bg-primary/10 text-primary",
  warning: "border-warning/30 bg-warning/10 text-warning",
} as const;

/** What the status means right now: why it was rejected, when it goes live, that it awaits review. */
export const ContentStatusBanner: React.FC<ContentStatusBannerProps> = ({ content, className }) => {
  const banner = (() => {
    switch (content?.status) {
      case ContentLifecycleStatus.Rejected:
        return {
          tone: TONES.destructive,
          icon: XCircle,
          title: "Rejected",
          text: content?.rejectionReason || "No reason given.",
        };
      case ContentLifecycleStatus.Scheduled:
        return {
          tone: TONES.primary,
          icon: CalendarClock,
          title: "Scheduled",
          text: `Goes live ${formatGoLive(content?.scheduledAt)}`,
        };
      case ContentLifecycleStatus.PendingApproval:
        return {
          tone: TONES.warning,
          icon: Clock,
          title: "Awaiting approval",
          text: "Submitted for review — an admin with publish rights can approve or reject it.",
        };
      default:
        return null;
    }
  })();

  if (!banner) return null;
  const Icon = banner.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm",
        banner.tone,
        className,
      )}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">{banner.title}</span>
        <span className="text-foreground"> — {banner.text}</span>
      </p>
    </div>
  );
};

ContentStatusBanner.displayName = "ContentStatusBanner";
