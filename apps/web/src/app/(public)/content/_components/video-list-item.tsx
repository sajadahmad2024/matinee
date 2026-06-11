"use client";

import { useState } from "react";

import {
  Archive,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Gamepad2,
  History,
  Megaphone,
  Pencil,
  Play,
  Rocket,
  ScrollText,
  ThumbsUp,
  Trash2,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../games/_components/glass-card";
import type { VideoItem } from "../constants";
import { ContentSignals } from "./content-signals";
import { ApprovalModal } from "./approval-modal";
import { PreviewAsUserModal } from "./preview-as-user-modal";
import { StatusBadge } from "./status-badge";
import { WorkflowHistory } from "./workflow-history";

interface VideoListItemProps {
  video: VideoItem;
  onEdit: (id: string) => void;
  onAnalytics: (id: string) => void;
  onLeaderboards: (id: string) => void;
}

export function VideoListItem({ video, onEdit, onAnalytics, onLeaderboards }: VideoListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [approval, setApproval] = useState<"approve" | "reject" | null>(null);

  const isPending = video.status === "pending";

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const renewLicense = () =>
    toast.info(
      video.licenseTerms ? `License terms — ${video.licenseTerms}` : "No license on file",
    );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <GlassCard
            className={cn(
              "hover:border-primary/50 group overflow-hidden transition-all duration-300",
              isHovered && "shadow-glow-sm shadow-primary/10",
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div className="relative flex items-center gap-5 p-4">
              {/* Thumbnail */}
              <div className="group/thumb relative h-24 w-36 shrink-0 overflow-hidden rounded-lg">
                <div
                  className={cn(
                    "absolute inset-0 bg-linear-to-br",
                    video.status === "boosted"
                      ? "from-featured/40 to-accent/30"
                      : video.isLive
                        ? "from-destructive/40 to-warning/30"
                        : video.isFeatured
                          ? "from-featured/40 to-primary/30"
                          : "from-primary/30 to-accent/20",
                  )}>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                      backgroundSize: "16px 16px",
                    }}
                  />
                </div>
                {video.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={video.thumbnail} alt={video.title} className="absolute inset-0 h-full w-full object-cover" />
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      "bg-background/30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300",
                      "group-hover/thumb:bg-primary/50 group-hover/thumb:scale-110",
                    )}>
                    <Play className="ml-0.5 h-5 w-5 text-white" />
                  </div>
                </div>

                {video.isLive && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-destructive text-destructive-foreground flex animate-pulse items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      LIVE
                    </div>
                  </div>
                )}
                {video.isFeatured && !video.isLive && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-featured text-featured-foreground flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                      <Zap className="h-3 w-3" />
                      FEATURED
                    </div>
                  </div>
                )}
                {video.status === "boosted" && !video.isLive && !video.isFeatured && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="from-featured to-accent flex items-center gap-1 rounded-full bg-linear-to-r px-2 py-0.5 text-[10px] font-bold text-white">
                      <Rocket className="h-3 w-3" />
                      BOOSTED
                    </div>
                  </div>
                )}

                <div className="absolute right-2 bottom-2 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-sm">
                  {video.duration}
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <h3 className="text-foreground group-hover:text-primary flex-1 truncate text-base font-semibold transition-colors">
                    {video.title}
                  </h3>
                  {video.sponsored && (
                    <Badge variant="outline" className="border-featured/40 text-featured gap-1 text-[10px]">
                      <Megaphone className="h-3 w-3" />
                      Sponsored{video.adDurationSecs ? ` · ${video.adDurationSecs}s ad` : ""}
                    </Badge>
                  )}
                  <StatusBadge status={video.status} />
                </div>

                <p className="text-muted-foreground text-sm font-medium">
                  {video.studioName}
                  {video.sponsored && video.sponsor ? ` · sponsored by ${video.sponsor}` : ""}
                </p>

                {/* primary stats */}
                <div className="flex flex-wrap items-center gap-3">
                  <Stat icon={<Eye className="text-primary h-3.5 w-3.5" />} wrap="bg-primary/10">
                    <span className="text-foreground font-medium">{formatNumber(video.views)}</span>
                    <span className="text-muted-foreground">views</span>
                  </Stat>
                  <Stat icon={<ThumbsUp className="text-success h-3.5 w-3.5" />} wrap="bg-success/10">
                    <span className="text-foreground font-medium">{formatNumber(video.likes)}</span>
                  </Stat>
                  <Stat icon={<Clock className="text-accent h-3.5 w-3.5" />} wrap="bg-accent/10">
                    <span className="text-muted-foreground">{video.duration}</span>
                  </Stat>
                  {video.linkedGames > 0 && (
                    <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent gap-1.5">
                      <Gamepad2 className="h-3.5 w-3.5" />
                      {video.linkedGames} Game{video.linkedGames > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {video.scheduledAt && (
                    <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {video.scheduledAt}
                    </Badge>
                  )}
                </div>

                {/* signals: licensing · performance · operational · metadata */}
                <ContentSignals video={video} />
              </div>

              {/* approval actions (Requests tab) — always visible for pending submissions */}
              {isPending && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-success hover:bg-success/90 gap-1.5"
                    onClick={() => setApproval("approve")}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => setApproval("reject")}>
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
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
                    <Button variant="ghost" size="icon" onClick={() => onEdit(video.id)} className="hover:bg-primary/20 hover:text-primary h-9 w-9 rounded-lg">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Video Details</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onAnalytics(video.id)} className="hover:bg-success/20 hover:text-success h-9 w-9 rounded-lg">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Analytics</TooltipContent>
                </Tooltip>
                {video.linkedGames > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => onLeaderboards(video.id)} className="hover:bg-warning/20 hover:text-warning h-9 w-9 rounded-lg">
                        <Trophy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Game Leaderboards</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* workflow history (collapsible) */}
            {video.workflow?.length ? (
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <div className="border-border/30 border-t px-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground h-8 gap-1.5 px-0">
                      <History className="h-3.5 w-3.5" />
                      Workflow history
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", historyOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <WorkflowHistory events={video.workflow} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : null}

            {(video.status === "boosted" || video.isLive) && (
              <div
                className={cn(
                  "absolute right-0 bottom-0 left-0 h-0.5",
                  video.isLive
                    ? "from-destructive via-warning to-destructive animate-pulse bg-linear-to-r"
                    : "from-featured via-accent to-featured bg-linear-to-r",
                )}
              />
            )}
          </GlassCard>
        </ContextMenuTrigger>

        {/* right-click menu */}
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => onEdit(video.id)}>
            <Pencil className="mr-2 h-4 w-4" /> Quick edit
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setPreviewOpen(true)}>
            <Play className="mr-2 h-4 w-4" /> Preview as user
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAnalytics(video.id)}>
            <BarChart3 className="mr-2 h-4 w-4" /> View detail page
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => toast.success(`Boosting “${video.title}”`)}>
            <Rocket className="mr-2 h-4 w-4" /> Promote / boost
          </ContextMenuItem>
          <ContextMenuItem onClick={renewLicense}>
            <ScrollText className="mr-2 h-4 w-4" /> Renew / view license
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => toast.success(`Archived “${video.title}”`)}>
            <Archive className="mr-2 h-4 w-4" /> Archive / unpublish
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => toast.success(`Deleted “${video.title}”`)}
            className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <PreviewAsUserModal open={previewOpen} onOpenChange={setPreviewOpen} video={video} />

      {approval && (
        <ApprovalModal
          open={!!approval}
          onOpenChange={(o) => !o && setApproval(null)}
          mode={approval}
          title={video.title}
        />
      )}
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
      <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", wrap)}>{icon}</div>
      {children}
    </div>
  );
}
