"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";

import { addDays, differenceInCalendarDays, format as formatDate, startOfToday } from "date-fns";
import { ArrowRight, CalendarIcon, Megaphone, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../../games/_components/glass-card";
import { BannerUpload } from "../../../games/format/_components/shared/banner-upload";

// Pre-roll video ads moved out of the per-video form into the platform-level Ads
// Management module (/ads, spec-07) — they run between reels, not on one video.
type AdFormat = "organic" | "sponsored";

/**
 * Ad-Sales format for a piece of content:
 *  - organic:    no sponsor.
 *  - sponsored:  content carrying a sponsor logo shown as an icon overlay between the deal's
 *                start and end dates.
 */
export function SponsorshipCard() {
  const [format, setFormat] = useState<AdFormat>("organic");
  const [advertiser, setAdvertiser] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  // defaults to a 30-day deal starting today
  const [overlayStart, setOverlayStart] = useState<Date | undefined>(startOfToday());
  const [overlayEnd, setOverlayEnd] = useState<Date | undefined>(addDays(startOfToday(), 30));

  // inclusive of both days — a deal starting and ending on the same day runs for 1 day
  const overlayDays =
    overlayStart && overlayEnd ? differenceInCalendarDays(overlayEnd, overlayStart) + 1 : null;

  const handleOverlayStartChange = (date?: Date) => {
    setOverlayStart(date);
    // keep the range valid — drop an end date that now falls before the new start
    if (date && overlayEnd && overlayEnd < date) setOverlayEnd(undefined);
  };

  const showFields = format === "sponsored";

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2 text-base">
          <Megaphone className="text-featured h-4 w-4" /> Ad Sales &amp; Sponsorship
        </CardTitle>
        <CardDescription>
          Mark content as sponsored — a &ldquo;Sponsored by&rdquo; logo shown as an icon overlay on
          the video.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as AdFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card z-50">
              <SelectItem value="organic">Organic — no sponsor</SelectItem>
              <SelectItem value="sponsored">Sponsored — sponsor logo overlay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFields && (
          <>
            <div className="space-y-2">
              <Label htmlFor="advertiser">Sponsor / Brand</Label>
              <Input
                id="advertiser"
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
                placeholder="e.g. Nike, Coca-Cola"
              />
            </div>

            <div className="space-y-2">
              <Label>Sponsor banner / logo</Label>
              <BannerUpload
                value={banner}
                onChange={setBanner}
                aspect="aspect-[16/6]"
                hint="16:6 · the “Sponsored by” logo/banner shown on the content"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                Icon overlay duration
              </Label>
              <div className="flex flex-wrap gap-4">
                <div className="w-full space-y-1 sm:w-[220px]">
                  <Label className="text-muted-foreground text-xs">Start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !overlayStart && "text-muted-foreground",
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {overlayStart ? formatDate(overlayStart, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={overlayStart}
                        onSelect={handleOverlayStartChange}
                        initialFocus
                        disabled={(date) => date < startOfToday()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-full space-y-1 sm:w-[220px]">
                  <Label className="text-muted-foreground text-xs">End date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !overlayEnd && "text-muted-foreground",
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {overlayEnd ? formatDate(overlayEnd, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={overlayEnd}
                        onSelect={setOverlayEnd}
                        initialFocus
                        disabled={(date) => date < (overlayStart ?? startOfToday())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {overlayDays
                  ? `The sponsor overlay stays on the video for ${overlayDays} day${overlayDays === 1 ? "" : "s"}.`
                  : "Pick the start and end dates of the sponsorship deal."}
              </p>
            </div>

            <p className="text-muted-foreground text-xs">
              Revenue tracking and billing are settled by the Ad-Sales ledger.
            </p>
          </>
        )}

        <Link
          href={"/ads" as Route}
          className="border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs transition-colors">
          <span>Looking for video ads between reels? They live in Ads Management.</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        </Link>
      </CardContent>
    </GlassCard>
  );
}
