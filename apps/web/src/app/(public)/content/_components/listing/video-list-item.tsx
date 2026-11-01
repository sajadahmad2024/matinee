"use client";

import { useState } from "react";

import Image from "next/image";

import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Gamepad2,
  Megaphone,
  MonitorPlay,
  Play,
  Rocket,
  ThumbsUp,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/app/_libs/utils/cn";
import { CustomActionsMenu } from "@/components/custom/custom-actions-menu";
import { CustomConfirmationModal } from "@/components/custom/custom-confirmation-modal";
import { GlassCard } from "@/components/custom/glass-card";

import { useContentCardActions } from "../../_libs/listing/use-content-card-actions";
import { hasAnalytics } from "../../_shared/content-config";
import { formatScheduledAt } from "../../_shared/content-format";
import { ContentStatusBadge } from "../../_shared/content-status-badge";
import { BoostModal } from "../../_shared/video-form/boost-modal";
import { ScheduleModal } from "../../_shared/video-form/schedule-modal";
import { VideoPlayerModal } from "../../_shared/video-player/video-player-modal";
import { ContentSignals } from "./content-signals";
import {
  type ContentRow,
  formatCount,
  formatDuration,
  isBoosted,
  isDraft,
  isPendingApproval,
  isSponsored,
  toBadgeStatus,
} from "./listing-config";
import { RejectModal } from "./reject-modal";

interface VideoListItemProps {
  video: ContentRow;
  variant?: "default" | "master";
  /** The admin has `content:publish` — gates Publish, Schedule, Unschedule and Reject. */
  canPublish: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onAnalytics: (id: string) => void;
}

export function VideoListItem({
  video,
  variant = "default",
  canPublish,
  onView,
  onEdit,
  onAnalytics,
}: VideoListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const actions = useContentCardActions({ video, canPublish, onEdit });

  const isPending = isPendingApproval(video);
  const draft = isDraft(video);
  const boosted = isBoosted(video);
  const sponsored = isSponsored(video);
  const duration = formatDuration(video?.durationSeconds);
  const linkedGames = video?.linkedGamesCount ?? 0;

  return (
    <>
      <GlassCard
        className={cn(
          "hover:border-primary/50 group overflow-hidden transition-all duration-300",
          isHovered && "shadow-glow-sm shadow-primary/10",
          variant === "master" &&
            (video?.status === "scheduled"
              ? "border-l-primary border-l-2"
              : "border-l-success border-l-2"),
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <div className="relative flex items-center gap-5 p-4">
          <div className="group/thumb relative h-20 w-35.5 shrink-0 overflow-hidden rounded-lg">
            <div
              className={cn(
                "absolute inset-0 bg-linear-to-br",
                boosted ? "from-featured/40 to-accent/30" : "from-primary/30 to-accent/20",
              )}>
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: "16px 16px",
                }}
              />
            </div>
            {video?.thumbnailUrl && (
              <Image
                src={video?.thumbnailUrl}
                alt={video?.title}
                fill
                unoptimized
                sizes="142px"
                className="object-cover"
              />
            )}

            {/* Play shows only when there's a video to watch. */}
            {video?.videoMediaId && (
              <button
                type="button"
                aria-label={`Play ${video?.title}`}
                onClick={() => setPlayerOpen(true)}
                className="absolute inset-0 flex cursor-pointer items-center justify-center">
                <span
                  className={cn(
                    "bg-background/30 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300",
                    "group-hover/thumb:bg-primary/50 group-hover/thumb:scale-110",
                  )}>
                  <Play className="ml-0.5 h-4 w-4 text-white" />
                </span>
              </button>
            )}

            {boosted && (
              <div className="absolute top-2 left-2 z-10">
                <div className="from-featured to-accent flex items-center gap-1 rounded-full bg-linear-to-r px-2 py-0.5 text-[10px] font-bold text-white">
                  <Rocket className="h-3 w-3" />
                  BOOSTED
                </div>
              </div>
            )}

            {!draft && (
              <div className="absolute right-2 bottom-2 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-sm">
                {duration}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start gap-3">
              <h3 className="text-foreground group-hover:text-primary flex-1 truncate text-base font-semibold transition-colors">
                {video?.title}
              </h3>
              {sponsored && (
                <Badge
                  variant="outline"
                  className="border-featured/40 text-featured gap-1 text-[10px]">
                  <Megaphone className="h-3 w-3" />
                  Sponsored
                </Badge>
              )}
              {boosted && <ContentStatusBadge status="boosted" />}
              <ContentStatusBadge status={toBadgeStatus(video?.status)} />
            </div>

            <p className="text-muted-foreground text-sm font-medium">
              {video?.studioName}
              {sponsored && video?.sponsorName ? ` · sponsored by ${video?.sponsorName}` : ""}
            </p>

            {/* primary stats — a draft has no views, likes or duration to show yet */}
            <div className="flex flex-wrap items-center gap-3">
              {!draft && (
                <>
                  <Stat icon={<Eye className="text-primary h-3.5 w-3.5" />} wrap="bg-primary/10">
                    <span className="text-foreground font-medium">
                      {formatCount(video?.viewCount ?? 0)}
                    </span>
                    <span className="text-muted-foreground">views</span>
                  </Stat>
                  <Stat
                    icon={<ThumbsUp className="text-success h-3.5 w-3.5" />}
                    wrap="bg-success/10">
                    <span className="text-foreground font-medium">
                      {formatCount(video?.likeCount ?? 0)}
                    </span>
                  </Stat>
                  <Stat icon={<Clock className="text-accent h-3.5 w-3.5" />} wrap="bg-accent/10">
                    <span className="text-muted-foreground">{duration}</span>
                  </Stat>
                </>
              )}
              {linkedGames > 0 && (
                <Badge
                  variant="outline"
                  className="bg-accent/10 border-accent/30 text-accent gap-1.5">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  {linkedGames} Game{linkedGames > 1 ? "s" : ""}
                </Badge>
              )}
              {(video?.watchLinks?.length ?? 0) > 0 && (
                <Badge
                  variant="outline"
                  className="bg-success/10 border-success/30 text-success gap-1.5"
                  title={video?.watchLinks?.map((w) => w?.label ?? w?.platform)?.join(", ")}>
                  <MonitorPlay className="h-3.5 w-3.5" />
                  Watch CTA ✓
                </Badge>
              )}
              {video?.scheduledAt && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 border-primary/30 text-primary gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatScheduledAt(video?.scheduledAt)}
                </Badge>
              )}
            </div>

            {/* signals: licensing · performance · operational · metadata */}
            <ContentSignals video={video} />
          </div>

          {/* approval actions (Requests tab) — always visible for pending submissions */}
          {isPending && (actions.canApprove || actions.canReject) && (
            <div className="flex items-center gap-2">
              {actions.canApprove && (
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90 cursor-pointer gap-1.5"
                  disabled={actions.isRunning}
                  onClick={actions.approve}>
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
              )}
              {actions.canReject && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5"
                  disabled={actions.isRunning}
                  onClick={actions.reject}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              )}
            </div>
          )}

          {/* hover actions */}
          <div
            className={cn(
              "flex items-center gap-1 transition-all duration-300",
              "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
            )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(video?.id)}
                  aria-label="View details"
                  className="hover:bg-primary/20 hover:text-primary h-9 w-9 cursor-pointer rounded-lg">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
            {hasAnalytics(video?.status) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAnalytics(video?.id)}
                    aria-label="View analytics"
                    className="hover:bg-success/20 hover:text-success h-9 w-9 cursor-pointer rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Analytics</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Every action the backend supports — always visible, unlike the hover icons. */}
          <CustomActionsMenu
            actions={actions.menuActions}
            label={`Actions for ${video?.title}`}
            isLoading={actions.isRunning}
          />
        </div>

        {boosted && (
          <div className="from-featured via-accent to-featured absolute right-0 bottom-0 left-0 h-0.5 bg-linear-to-r" />
        )}
      </GlassCard>

      {video?.videoMediaId && (
        <VideoPlayerModal
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          title={video?.title}
          mediaId={video.videoMediaId}
          poster={video?.thumbnailUrl}
        />
      )}

      <CustomConfirmationModal {...actions.confirmModal} />
      <RejectModal {...actions.rejectModal} />
      <ScheduleModal {...actions.scheduleModal} />
      <BoostModal {...actions.boostModal} />
    </>
  );
}

function Stat({
  icon,
  wrap,
  children,
}: {
  icon: React.ReactNode;
  wrap: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", wrap)}>
        {icon}
      </div>
      {children}
    </div>
  );
}
