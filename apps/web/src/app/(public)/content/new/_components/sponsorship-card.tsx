"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";

import { addDays, differenceInCalendarDays, startOfToday } from "date-fns";
import { ArrowRight, Megaphone, Timer } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { CustomDatePicker } from "@/components/custom/custom-date-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

import { BannerUpload } from "../../../games/format/_components/shared/banner-upload";

// Pre-roll video ads moved out of the per-video form into the platform-level Ads
// Management module (/ads, spec-07) — they run between reels, not on one video.
type AdFormat = "organic" | "sponsored";

const FORMAT_OPTIONS: CustomSelectOption<AdFormat>[] = [
  { value: "organic", label: "Organic — no sponsor" },
  { value: "sponsored", label: "Sponsored — sponsor logo overlay" },
];

const DATE_FIELD_CLASS = "w-full space-y-1 sm:w-[220px]";
const DATE_LABEL_CLASS = "text-muted-foreground text-xs";

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
        <CustomField label="Format" htmlFor="ad-format">
          <CustomSelect
            id="ad-format"
            options={FORMAT_OPTIONS}
            value={format}
            onValueChange={setFormat}
          />
        </CustomField>

        {showFields && (
          <>
            <CustomField label="Sponsor / Brand" htmlFor="advertiser">
              <Input
                id="advertiser"
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
                placeholder="e.g. Nike, Coca-Cola"
              />
            </CustomField>

            <CustomField label="Sponsor banner / logo">
              <BannerUpload
                value={banner}
                onChange={setBanner}
                aspect="aspect-[16/6]"
                hint="16:6 · the “Sponsored by” logo/banner shown on the content"
              />
            </CustomField>

            <CustomField
              labelClassName="flex items-center gap-1.5"
              label={
                <>
                  <Timer className="h-3.5 w-3.5" />
                  Icon overlay duration
                </>
              }>
              <div className="flex flex-wrap gap-4">
                <CustomField
                  label="Start date"
                  className={DATE_FIELD_CLASS}
                  labelClassName={DATE_LABEL_CLASS}>
                  <CustomDatePicker
                    value={overlayStart}
                    onChange={handleOverlayStartChange}
                    isDateDisabled={(date) => date < startOfToday()}
                  />
                </CustomField>
                <CustomField
                  label="End date"
                  className={DATE_FIELD_CLASS}
                  labelClassName={DATE_LABEL_CLASS}>
                  <CustomDatePicker
                    value={overlayEnd}
                    onChange={setOverlayEnd}
                    isDateDisabled={(date) => date < (overlayStart ?? startOfToday())}
                  />
                </CustomField>
              </div>
              <p className="text-muted-foreground text-xs">
                {overlayDays
                  ? `The sponsor overlay stays on the video for ${overlayDays} day${overlayDays === 1 ? "" : "s"}.`
                  : "Pick the start and end dates of the sponsorship deal."}
              </p>
            </CustomField>

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
