"use client";

import type { Route } from "next";
import Link from "next/link";

import { differenceInHours, format } from "date-fns";
import { ChevronRight, Gavel, ImageIcon, Trophy, Users } from "lucide-react";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";
import { cn } from "@/app/_libs/utils/cn";

import {
  type ExperienceReward,
  type ExperienceStatus,
  flagEmoji,
  formatPoints,
} from "../constants";

const STATUS_BADGE: Record<ExperienceStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-info/20 text-info" },
  live: { label: "Live", className: "bg-success/20 text-success" },
  ended: { label: "Ended", className: "bg-primary/15 text-primary" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground" },
};

export function geofenceLabel(geofence: string[]): string {
  const flags = geofence.map(flagEmoji).join(" ");
  const names = geofence.map((c) => (c === "GB" ? "UK" : c)).join(", ");
  return `${flags} ${names} only`;
}

interface ExperienceListItemProps {
  experience: ExperienceReward;
}

export function ExperienceListItem({ experience: e }: ExperienceListItemProps) {
  const badge = STATUS_BADGE[e.status];
  const hoursToClose = differenceInHours(new Date(e.bidCloseAt), new Date());
  const daysToClose = Math.max(0, Math.ceil(hoursToClose / 24));
  const closingSoon = e.status === "live" && hoursToClose <= 24;

  return (
    <Link href={`/rewards/experience/${e.id}` as Route} className="block">
      <GlassCard
        className={cn(
          "hover:border-primary/50 overflow-hidden border-l-2 p-0 transition-all",
          // live vs scheduled color-coding — consistent with content's master list
          e.status === "live"
            ? "border-l-success"
            : e.status === "scheduled"
              ? "border-l-primary"
              : "border-l-border/50",
        )}>
        {/* Inner flex row — Card is flex-col by default, so the row lives here (same
            structure as VideoListItem / GameTypeRow / the unlock-content rows). */}
        <div className="flex items-center gap-4 p-4">
          {/* image thumb */}
          <div className="bg-muted/40 flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md">
            {e.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="text-muted-foreground h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground truncate text-sm font-semibold">{e.title}</span>
              <span className="border-border/60 text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">
                {geofenceLabel(e.geofence)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  badge.className,
                )}>
                {badge.label}
              </span>
            </div>

            <p className="text-muted-foreground text-xs">
              Bids: {format(new Date(e.bidOpenAt), "MMM d")} →{" "}
              {format(new Date(e.bidCloseAt), "MMM d")}
              {e.status === "live" && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    closingSoon
                      ? "bg-destructive/15 text-destructive"
                      : "bg-warning/15 text-warning",
                  )}>
                  {hoursToClose <= 0
                    ? "bidding closed — settle now"
                    : closingSoon
                      ? `closes in ${Math.max(1, hoursToClose)}h`
                      : `closes in ${daysToClose}d`}
                </span>
              )}
              <span className="text-border mx-1.5">·</span>
              Experience: {format(new Date(e.experienceAt), "MMM yyyy")}
            </p>
          </div>

          {/* bid state */}
          <div className="hidden shrink-0 text-right sm:block">
            {e.status === "ended" && e.winner ? (
              <>
                <p className="text-foreground flex items-center justify-end gap-1 text-sm font-semibold tabular-nums">
                  <Trophy className="text-warning h-3.5 w-3.5" />
                  {formatPoints(e.winner.bid)} pts
                </p>
                <p className="text-muted-foreground text-[11px]">won by {e.winner.user}</p>
              </>
            ) : e.status === "live" ? (
              <>
                <p className="text-foreground flex items-center justify-end gap-1 text-sm font-semibold tabular-nums">
                  <Gavel className="text-success h-3.5 w-3.5" />
                  {e.topBid ? `${formatPoints(e.topBid)} pts` : "No bids yet"}
                </p>
                <p className="text-muted-foreground flex items-center justify-end gap-1 text-[11px]">
                  <Users className="h-3 w-3" /> {e.bidders.toLocaleString()} bidders
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-[11px]">
                {e.status === "scheduled" ? "Opens soon" : badge.label}
              </p>
            )}
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              Min bid {e.minBid.toLocaleString()} pts
            </p>
          </div>

          <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
        </div>
      </GlassCard>
    </Link>
  );
}
