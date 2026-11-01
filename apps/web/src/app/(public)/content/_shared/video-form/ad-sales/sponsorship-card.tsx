"use client";

import { differenceInCalendarDays, startOfToday } from "date-fns";
import { Megaphone, Timer } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { CONTENT_LIMITS, type ContentCreateFormValues, SponsorshipFormat } from "@/app/_libs/schemas";
import { CustomDatePicker } from "@/components/custom/custom-date-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

import { SPONSORSHIP_FORMAT_OPTIONS } from "../../../_libs/video-form/ad-sales/ad-sales-options";
import { SponsorBannerUpload } from "./sponsor-banner-upload";

const DATE_FIELD_CLASS = "w-full space-y-1 sm:w-[220px]";
const DATE_LABEL_CLASS = "text-muted-foreground text-xs";

/**
 * Ad Sales — the last step, saved by the footer actions (`PUT /:id/sponsorship`):
 *  - organic:    no sponsor (`DELETE` if one was saved).
 *  - sponsored:  a sponsor logo shown as an icon overlay between the deal's start and end dates.
 */
export function SponsorshipCard() {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();
  const format = useWatch({ control, name: "sponsorship.format" });
  const startsAt = useWatch({ control, name: "sponsorship.startsAt" });
  const endsAt = useWatch({ control, name: "sponsorship.endsAt" });
  const sponsorshipErrors = errors?.sponsorship;

  // inclusive of both days — a deal starting and ending on the same day runs for 1 day
  const overlayDays = startsAt && endsAt ? differenceInCalendarDays(endsAt, startsAt) + 1 : null;

  const changeStart = (date?: Date) => {
    setValue("sponsorship.startsAt", date, { shouldDirty: true });
    // keep the range valid — drop an end date that now falls before the new start
    const end = getValues("sponsorship.endsAt");
    if (date && end && end < date) setValue("sponsorship.endsAt", undefined, { shouldDirty: true });
  };

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
          <Controller
            control={control}
            name="sponsorship.format"
            render={({ field }) => (
              <CustomSelect
                id="ad-format"
                options={SPONSORSHIP_FORMAT_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </CustomField>

        {format === SponsorshipFormat.Sponsored && (
          <>
            <CustomField
              label="Sponsor / Brand"
              htmlFor="advertiser"
              error={sponsorshipErrors?.sponsorName?.message}>
              <Input
                id="advertiser"
                placeholder="e.g. Nike, Coca-Cola"
                maxLength={CONTENT_LIMITS.sponsorNameMax}
                aria-invalid={!!sponsorshipErrors?.sponsorName}
                {...register("sponsorship.sponsorName")}
              />
            </CustomField>

            <CustomField label="Sponsor banner / logo">
              <SponsorBannerUpload />
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
                    value={startsAt}
                    onChange={changeStart}
                    isDateDisabled={(date) => date < startOfToday()}
                  />
                </CustomField>
                <CustomField
                  label="End date"
                  className={DATE_FIELD_CLASS}
                  labelClassName={DATE_LABEL_CLASS}
                  error={sponsorshipErrors?.endsAt?.message}>
                  <Controller
                    control={control}
                    name="sponsorship.endsAt"
                    render={({ field }) => (
                      <CustomDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        isDateDisabled={(date) => date < (startsAt ?? startOfToday())}
                      />
                    )}
                  />
                </CustomField>
              </div>
              <p className="text-muted-foreground text-xs">
                {overlayDays
                  ? `The sponsor overlay stays on the video for ${overlayDays} day${overlayDays === 1 ? "" : "s"}.`
                  : "Pick the start and end dates of the sponsorship deal."}
              </p>
            </CustomField>
          </>
        )}
      </CardContent>
    </GlassCard>
  );
}
