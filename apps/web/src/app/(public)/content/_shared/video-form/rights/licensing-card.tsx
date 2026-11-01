"use client";

import { ScrollText } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CONTENT_LIMITS, type ContentCreateFormValues, LicenseKind } from "@/app/_libs/schemas";
import { CustomDatePicker } from "@/components/custom/custom-date-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

import {
  CURRENCY_OPTIONS,
  LICENSE_KIND_OPTIONS,
  RENEWAL_OPTIONS,
} from "../../../_libs/video-form/rights/rights-options";

/**
 * Wizard step 2 — licensing & rights. "Original" = owned (no licence row). "Licensed" is saved
 * with `PUT /:id/license` when the step is left (see the add page's `saveLicense`).
 */
export function LicensingCard() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();
  const kind = useWatch({ control, name: "license.kind" });
  const startsAt = useWatch({ control, name: "license.startsAt" });
  const licenseErrors = errors?.license;

  return (
    <GlassCard>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <ScrollText className="text-primary h-4 w-4" /> Licensing &amp; Rights
            </CardTitle>
            <CardDescription>
              Owned originals need nothing here. Licensed titles drive the expiry alerts, ROI table
              and the row license chip.
            </CardDescription>
          </div>
          <Controller
            control={control}
            name="license.kind"
            render={({ field }) => (
              <CustomSelect
                options={LICENSE_KIND_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                triggerClassName="shrink-0"
                aria-label="License type"
              />
            )}
          />
        </div>
      </CardHeader>

      {kind === LicenseKind.Licensed && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CustomField
              label="Licensor / rights holder"
              htmlFor="licensor"
              error={licenseErrors?.licensorName?.message}>
              <Input
                id="licensor"
                placeholder="e.g., Global Rights Co"
                maxLength={CONTENT_LIMITS.licensorMax}
                aria-invalid={!!licenseErrors?.licensorName}
                {...register("license.licensorName")}
              />
            </CustomField>
            <CustomField
              label="Revenue source"
              htmlFor="revenue-source"
              error={licenseErrors?.revenueSource?.message}>
              <Input
                id="revenue-source"
                placeholder="e.g., Ads + Subs"
                maxLength={CONTENT_LIMITS.revenueSourceMax}
                aria-invalid={!!licenseErrors?.revenueSource}
                {...register("license.revenueSource")}
              />
            </CustomField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CustomField label="License start" htmlFor="license-start">
              <Controller
                control={control}
                name="license.startsAt"
                render={({ field }) => (
                  <CustomDatePicker
                    id="license-start"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start date"
                  />
                )}
              />
            </CustomField>
            <CustomField
              label="License expiry"
              htmlFor="license-expiry"
              error={licenseErrors?.expiresAt?.message}>
              <Controller
                control={control}
                name="license.expiresAt"
                render={({ field }) => (
                  <CustomDatePicker
                    id="license-expiry"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Expiry date"
                    isDateDisabled={(date) => !!startsAt && date <= startsAt}
                  />
                )}
              />
            </CustomField>
            <CustomField label="Renewal status" htmlFor="renewal-status">
              <Controller
                control={control}
                name="license.renewalStatus"
                render={({ field }) => (
                  <CustomSelect
                    id="renewal-status"
                    options={RENEWAL_OPTIONS}
                    value={field.value}
                    onValueChange={field.onChange}
                    triggerClassName="w-full"
                  />
                )}
              />
            </CustomField>
            <CustomField
              label="License cost"
              htmlFor="license-cost"
              error={licenseErrors?.cost?.message}>
              <div className="flex gap-2">
                <Input
                  id="license-cost"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Optional"
                  className="min-w-0 flex-1"
                  aria-invalid={!!licenseErrors?.cost}
                  {...register("license.cost", { valueAsNumber: true })}
                />
                <Controller
                  control={control}
                  name="license.currency"
                  render={({ field }) => (
                    <CustomSelect
                      options={CURRENCY_OPTIONS}
                      value={field.value}
                      onValueChange={field.onChange}
                      triggerClassName="w-[84px] shrink-0"
                      aria-label="Currency"
                    />
                  )}
                />
              </div>
            </CustomField>
          </div>

          <CustomField
            label="License terms"
            htmlFor="license-terms"
            error={licenseErrors?.terms?.message}>
            <Textarea
              id="license-terms"
              placeholder="e.g., 12 months, exclusive, territory: APAC…"
              rows={2}
              maxLength={CONTENT_LIMITS.licenseTermsMax}
              // Grows with the text up to ~8 lines, then scrolls.
              className="max-h-48 resize-none overflow-y-auto"
              aria-invalid={!!licenseErrors?.terms}
              {...register("license.terms")}
            />
          </CustomField>
        </CardContent>
      )}
    </GlassCard>
  );
}
