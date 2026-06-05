"use client";

import {
  CheckCircle2,
  DollarSign,
  Flag,
  Globe,
  Megaphone,
  Minus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/app/_libs/utils/cn";

import type { VideoItem } from "../constants";

/** Compact per-row signals: licensing · performance health · operational · metadata. */
export function ContentSignals({ video }: { video: VideoItem }) {
  const engagement = video.views > 0 ? ((video.likes / video.views) * 100).toFixed(1) : null;

  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
      {/* Licensing */}
      {video.licenseStatus && <LicenseChip video={video} />}

      {/* Engagement (likes ÷ views) */}
      {engagement && (
        <Chip>
          <Sparkles className="h-3 w-3" />
          {engagement}% eng
        </Chip>
      )}

      {/* Completion */}
      {video.completionRate !== undefined && (
        <Chip>
          <CheckCircle2 className="h-3 w-3" />
          {video.completionRate}% compl
        </Chip>
      )}

      {/* Views trend */}
      {video.viewsTrend && <TrendChip trend={video.viewsTrend} />}

      {/* Revenue / 1K impressions */}
      {video.revenuePer1k !== undefined && (
        <Chip>
          <DollarSign className="h-3 w-3" />
          {video.revenuePer1k.toFixed(1)}/1K
        </Chip>
      )}

      {/* Recommendation status */}
      {video.recommendation && video.recommendation !== "normal" && (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 text-[10px]",
            video.recommendation === "promoted"
              ? "border-success/30 text-success"
              : "border-muted-foreground/30",
          )}>
          <Megaphone className="h-3 w-3" />
          {video.recommendation === "promoted" ? "Promoted" : "Deprioritized"}
        </Badge>
      )}

      {/* Unresolved moderation flags */}
      {video.unresolvedFlags ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-destructive inline-flex items-center gap-1">
              <span className="bg-destructive h-1.5 w-1.5 animate-pulse rounded-full" />
              <Flag className="h-3 w-3" />
              {video.unresolvedFlags}
            </span>
          </TooltipTrigger>
          <TooltipContent>{video.unresolvedFlags} unresolved flag(s)</TooltipContent>
        </Tooltip>
      ) : null}

      {/* Genres */}
      {video.genres?.slice(0, 2).map((g) => (
        <span key={g} className="inline-flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {g}
        </span>
      ))}

      {/* Language / region */}
      {(video.language || video.region) && (
        <span className="inline-flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {[video.language, video.region].filter(Boolean).join(" · ")}
        </span>
      )}

      {/* Last modified */}
      {video.lastModifiedBy && (
        <span className="text-muted-foreground/80">
          edited {video.lastModifiedAt ? `${video.lastModifiedAt} ` : ""}by {video.lastModifiedBy}
        </span>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1">{children}</span>;
}

function TrendChip({ trend }: { trend: "up" | "flat" | "down" }) {
  if (trend === "up")
    return (
      <span className="text-success inline-flex items-center gap-1">
        <TrendingUp className="h-3 w-3" /> rising
      </span>
    );
  if (trend === "down")
    return (
      <span className="text-destructive inline-flex items-center gap-1">
        <TrendingDown className="h-3 w-3" /> declining
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1">
      <Minus className="h-3 w-3" /> flat
    </span>
  );
}

function LicenseChip({ video }: { video: VideoItem }) {
  const { licenseStatus, licenseExpiresInDays: d, licensorName, licenseTerms, studioName } = video;

  const color =
    licenseStatus === "original"
      ? "text-info"
      : licenseStatus === "expired" || (d !== undefined && d < 30)
        ? "text-destructive"
        : d !== undefined && d <= 90
          ? "text-warning"
          : "text-success";

  const Icon = licenseStatus === "expired" ? ShieldAlert : ShieldCheck;
  const label =
    licenseStatus === "original"
      ? "Original"
      : licenseStatus === "expired"
        ? "Expired"
        : d !== undefined
          ? `${d}d left`
          : "Licensed";

  const showLicensor = licensorName && licensorName !== studioName;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center gap-1 font-medium", color)}>
          <Icon className="h-3.5 w-3.5" />
          {label}
          {showLicensor && <span className="text-muted-foreground">· {licensorName}</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium capitalize">{licenseStatus}</p>
        {licenseTerms && <p className="text-xs">{licenseTerms}</p>}
        {showLicensor && <p className="text-xs">Licensor: {licensorName}</p>}
      </TooltipContent>
    </Tooltip>
  );
}
