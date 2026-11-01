"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { type MacroRegion, regionLabel } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";
import { formatDateRange } from "@/app/_libs/utils/format";
import { CustomTabs } from "@/components/custom/custom-tabs";
import { StatusBadge } from "@/components/custom/status-badge";

import { AD_RANK_MAX, AD_STATUS_LABELS } from "../../_libs/ad-config";
import type { RankBoardDto, RankBookingDto, RegionRanksDto } from "../../_libs/ad-types";

/** The ad's own booking shows on the board while editing; it never blocks itself. */
export const otherBookings = (
  board: RankBoardDto | undefined,
  rank: number,
  selfId?: string,
): RankBookingDto[] =>
  board?.ranks?.find((r) => r?.rank === rank)?.bookings?.filter((b) => b?.campaignId !== selfId) ??
  [];

/** Lowest rank free for the flight, ignoring the ad's own booking; null when all are taken. */
export const freeRankIn = (board: RankBoardDto | undefined, selfId?: string) => {
  if (!board) return undefined;
  for (let rank = 1; rank <= AD_RANK_MAX; rank++) {
    if (!otherBookings(board, rank, selfId)?.length) return rank;
  }
  return null;
};

const asRank = (raw: string) => {
  const n = Number(raw);
  return raw.trim() !== "" && Number.isInteger(n) && n >= 1 && n <= AD_RANK_MAX ? n : undefined;
};

/** The ad that already holds the typed rank during the flight, if any. */
export const rankHolder = (board: RankBoardDto | undefined, raw: string, selfId?: string) => {
  const rank = asRank(raw);
  return rank ? otherBookings(board, rank, selfId)[0] : undefined;
};

const bookingLabel = (b: RankBookingDto) =>
  `${b?.advertiserName} — ${b?.campaignName} (${formatDateRange(b?.startsAt, b?.endsAt, { short: true })})`;

interface AdRankFieldsProps {
  regions: MacroRegion[];
  ranks: Partial<Record<MacroRegion, string>>;
  onRankChange: (region: MacroRegion, value: string) => void;
  /** Validation message per region (from the form schema). */
  errors?: Partial<Record<MacroRegion, string>>;
  rankBoards: Partial<Record<MacroRegion, RankBoardDto>>;
  /** The ad being edited. */
  selfId?: string;
  /** The edited ad's saved rank per region — no "free" message under it while it's unchanged. */
  savedRanks?: RegionRanksDto;
}

/** One rank input per targeted region with live availability, then the board for those dates. */
export function AdRankFields({
  regions,
  ranks,
  onRankChange,
  errors,
  rankBoards,
  selfId,
  savedRanks,
}: AdRankFieldsProps) {
  return (
    <>
      <p className="text-muted-foreground text-xs">
        An ad shows after every 5 videos. Rank 1 is the first ad slot, rank 2 the second, up to{" "}
        {AD_RANK_MAX}.
      </p>
      <div className="divide-border/30 divide-y">
        {regions?.map((code) => (
          <RankRow
            key={code}
            code={code}
            value={ranks[code] ?? ""}
            onChange={(value) => onRankChange(code, value)}
            board={rankBoards[code]}
            selfId={selfId}
            savedRank={savedRanks?.[code]}
            error={errors?.[code]}
          />
        ))}
      </div>
      <RankBoardView regions={regions} ranks={ranks} rankBoards={rankBoards} selfId={selfId} />
    </>
  );
}

function RankRow({
  code,
  value,
  onChange,
  board,
  selfId,
  savedRank,
  error,
}: {
  code: MacroRegion;
  value: string;
  onChange: (value: string) => void;
  board?: RankBoardDto;
  selfId?: string;
  savedRank?: number;
  error?: string;
}) {
  const id = `rank-${code}`;
  const holder = rankHolder(board, value, selfId);

  let status: { text: string; error: boolean } | null = null;
  if (value.trim() === "") {
    if (freeRankIn(board, selfId) === null) {
      status = {
        text: "No free rank for these dates. Change the dates or free a rank",
        error: true,
      };
    } else if (error) status = { text: "Enter a rank", error: true };
  } else if (asRank(value) === undefined) {
    status = { text: `Enter a whole number from 1 to ${AD_RANK_MAX}`, error: true };
  } else if (holder) {
    status = {
      text: `Rank ${value} is held by ${bookingLabel(holder)}. Pick another rank or change the dates`,
      error: true,
    };
  } else if (board && !(savedRank !== undefined && asRank(value) === savedRank)) {
    // the ad's own unchanged rank shows nothing: it's only "free" because it's this ad's booking
    // (a clash with another ad is caught above)
    status = { text: `Rank ${value} is free for these dates`, error: false };
  }

  return (
    // label and input on one line, the status under them from the row's left edge — every row's
    // message starts at the same point, whatever the region name's length
    <div className="space-y-1.5 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="font-normal">
          Rank in {regionLabel(code)}
        </Label>
        <Input
          id={id}
          type="number"
          min={1}
          max={AD_RANK_MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!status?.error}
          className="w-20 shrink-0"
        />
      </div>
      {status && (
        <p className={cn("text-xs", status.error ? "text-destructive" : "text-success")}>
          {status.text}
        </p>
      )}
    </div>
  );
}

/** Who holds each rank in a region during this ad's dates, and where this ad would land. */
function RankBoardView({
  regions,
  ranks,
  rankBoards,
  selfId,
}: {
  regions: MacroRegion[];
  ranks: Partial<Record<MacroRegion, string>>;
  rankBoards: Partial<Record<MacroRegion, RankBoardDto>>;
  selfId?: string;
}) {
  const [picked, setPicked] = useState<MacroRegion | null>(null);
  const region = picked && regions.includes(picked) ? picked : regions[0];
  const board = region ? rankBoards[region] : undefined;
  if (!region || !board) return null;

  const mine = asRank(ranks[region] ?? "");

  return (
    <div className="border-border/50 bg-background/30 mt-3 space-y-3 rounded-lg border p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">Ranks for these dates</p>
        {regions?.length > 1 && (
          <CustomTabs
            items={regions?.map((code) => ({ value: code, label: code }))}
            value={region}
            onValueChange={setPicked}
            triggerClassName="text-xs"
            aria-label="Region"
          />
        )}
      </div>
      <p className="text-muted-foreground text-xs">{regionLabel(region)}</p>
      <ul className="divide-border/30 divide-y">
        {board?.ranks?.map(({ rank }) => {
          const bookings = otherBookings(board, rank, selfId);
          const isMine = mine === rank;
          return (
            <li key={rank} className="flex gap-3 py-2 text-sm">
              <span className="w-8 shrink-0 font-medium tabular-nums">#{rank}</span>
              <div className="min-w-0 flex-1 space-y-1">
                {bookings?.length === 0 && !isMine && (
                  <span className="text-success text-xs">Free</span>
                )}
                {bookings?.map((b) => (
                  <div
                    key={b?.campaignId}
                    className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate">
                      {b?.advertiserName} — {b?.campaignName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDateRange(b?.startsAt, b?.endsAt, { short: true })}
                    </span>
                    <StatusBadge
                      status={b?.status}
                      label={AD_STATUS_LABELS[b?.status]}
                      className="text-[10px]"
                    />
                  </div>
                ))}
                {isMine && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      bookings?.length ? "text-destructive" : "text-primary",
                    )}>
                    {bookings?.length ? "This ad — clashes with the booking above" : "This ad"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
