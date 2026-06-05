"use client";

import { useState } from "react";

import {
  Archive,
  BarChart3,
  Calendar,
  Clock,
  Copy,
  Eye,
  Gamepad2,
  MoreVertical,
  Pencil,
  Play,
  Rocket,
  ThumbsUp,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../games/_components/glass-card";
import { type ContentStatus, StatusBadge } from "./status-badge";

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  studioName: string;
  duration: string;
  status: ContentStatus;
  linkedGames: number;
  views: number;
  likes: number;
  isLive?: boolean;
  isFeatured?: boolean;
  scheduledAt?: string;
}

interface VideoListItemProps {
  video: VideoItem;
  onEdit: (id: string) => void;
  onAnalytics: (id: string) => void;
  onLeaderboards: (id: string) => void;
}

export function VideoListItem({ video, onEdit, onAnalytics, onLeaderboards }: VideoListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getStatusGradient = () => {
    switch (video.status) {
      case "published":
        return "from-success/20 via-transparent to-transparent";
      case "boosted":
        return "from-featured/30 via-featured/10 to-transparent";
      case "scheduled":
        return "from-primary/20 via-transparent to-transparent";
      case "draft":
        return "from-muted/20 via-transparent to-transparent";
      case "pending":
        return "from-warning/20 via-transparent to-transparent";
      case "rejected":
        return "from-destructive/20 via-transparent to-transparent";
      default:
        return "from-transparent to-transparent";
    }
  };

  return (
    <GlassCard
      className={cn(
        "hover:border-primary/50 group overflow-hidden transition-all duration-300",
        isHovered && "shadow-glow-sm shadow-primary/10",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Content */}
      <div className="relative flex items-center gap-5 p-4">
        {/* Thumbnail with enhanced design */}
        <div className="group/thumb relative h-24 w-36 shrink-0 overflow-hidden rounded-lg">
          {/* Gradient background */}
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
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: "16px 16px",
              }}
            />
          </div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "bg-background/30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300",
                "group-hover/thumb:bg-primary/50 group-hover/thumb:scale-110",
              )}>
              <Play className="ml-0.5 h-5 w-5 text-white" />
            </div>
          </div>

          {/* Status badges */}
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

          {/* Duration pill */}
          <div className="absolute right-2 bottom-2 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-sm">
            {video.duration}
          </div>
        </div>

        {/* Info Section */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Title row */}
          <div className="flex items-start gap-3">
            <h3 className="text-foreground group-hover:text-primary flex-1 truncate text-base font-semibold transition-colors">
              {video.title}
            </h3>
            <StatusBadge status={video.status} />
          </div>

          {/* Studio name */}
          <p className="text-muted-foreground text-sm font-medium">{video.studioName}</p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Views */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                <Eye className="text-primary h-3.5 w-3.5" />
              </div>
              <span className="text-foreground font-medium">{formatNumber(video.views)}</span>
              <span className="text-muted-foreground">views</span>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="bg-success/10 flex h-6 w-6 items-center justify-center rounded-full">
                <ThumbsUp className="text-success h-3.5 w-3.5" />
              </div>
              <span className="text-foreground font-medium">{formatNumber(video.likes)}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="bg-accent/10 flex h-6 w-6 items-center justify-center rounded-full">
                <Clock className="text-accent h-3.5 w-3.5" />
              </div>
              <span className="text-muted-foreground">{video.duration}</span>
            </div>

            {/* Games badge */}
            {video.linkedGames > 0 && (
              <Badge
                variant="outline"
                className="bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 gap-1.5">
                <Gamepad2 className="h-3.5 w-3.5" />
                {video.linkedGames} Game{video.linkedGames > 1 ? "s" : ""}
              </Badge>
            )}

            {/* Scheduled date */}
            {video.scheduledAt && (
              <Badge
                variant="outline"
                className="bg-primary/10 border-primary/30 text-primary gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {video.scheduledAt}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
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
                onClick={() => onEdit(video.id)}
                className="hover:bg-primary/20 hover:text-primary h-9 w-9 rounded-lg">
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video Details</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAnalytics(video.id)}
                className="hover:bg-success/20 hover:text-success h-9 w-9 rounded-lg">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Analytics</TooltipContent>
          </Tooltip>

          {video.linkedGames > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onLeaderboards(video.id)}
                  className="hover:bg-warning/20 hover:text-warning h-9 w-9 rounded-lg">
                  <Trophy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Game Leaderboards</TooltipContent>
            </Tooltip>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted h-9 w-9 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-border bg-popover/95 w-48 backdrop-blur-md">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom accent line for boosted/live content */}
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
  );
}
