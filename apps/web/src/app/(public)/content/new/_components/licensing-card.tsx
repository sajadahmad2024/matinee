"use client";

import { useState } from "react";

import { ScrollText } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

type LicenseType = "original" | "licensed";

const LICENSE_TYPE_OPTIONS: CustomSelectOption<LicenseType>[] = [
  { value: "original", label: "Original / owned" },
  { value: "licensed", label: "Licensed" },
];

const RENEWAL_OPTIONS: CustomSelectOption[] = [
  { value: "renewing", label: "Renewing" },
  { value: "in_negotiation", label: "In negotiation" },
  { value: "expiring", label: "Expiring (not renewing)" },
  { value: "auto_renew", label: "Auto-renew" },
  { value: "lapsed", label: "Lapsed" },
];

const CURRENCY_OPTIONS: CustomSelectOption[] = ["USD", "EUR", "GBP", "INR", "BRL", "AED"].map(
  (c) => ({ value: c, label: c }),
);

/**
 * Licensing & rights for a piece of content. "Original" = owned (no agreement).
 * "Licensed" captures the operational agreement (content_licenses) + the row chip
 * signals (contents.license_status / licensor_name / license_expires_at / license_terms).
 */
export function LicensingCard() {
  const [licenseType, setLicenseType] = useState<LicenseType>("original");
  const [licensor, setLicensor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cost, setCost] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [revenueSource, setRevenueSource] = useState("");
  const [renewal, setRenewal] = useState("renewing");
  const [terms, setTerms] = useState("");

  const licensed = licenseType === "licensed";

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
          <CustomSelect
            options={LICENSE_TYPE_OPTIONS}
            value={licenseType}
            onValueChange={setLicenseType}
            triggerClassName="w-[150px]"
            aria-label="License type"
          />
        </div>
      </CardHeader>

      {licensed && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CustomField label="Licensor / rights holder" htmlFor="licensor">
              <Input
                id="licensor"
                value={licensor}
                onChange={(e) => setLicensor(e.target.value)}
                placeholder="e.g., Global Rights Co"
              />
            </CustomField>
            <CustomField label="Renewal status" htmlFor="renewal-status">
              <CustomSelect
                id="renewal-status"
                options={RENEWAL_OPTIONS}
                value={renewal}
                onValueChange={setRenewal}
              />
            </CustomField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CustomField label="License start" htmlFor="license-start">
              <Input
                id="license-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </CustomField>
            <CustomField label="License expiry" htmlFor="license-expiry">
              <Input
                id="license-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </CustomField>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CustomField label="License cost" htmlFor="license-cost">
              <Input
                id="license-cost"
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </CustomField>
            <CustomField label="Currency" htmlFor="license-currency">
              <CustomSelect
                id="license-currency"
                options={CURRENCY_OPTIONS}
                value={currency}
                onValueChange={setCurrency}
              />
            </CustomField>
            <CustomField label="Revenue source" htmlFor="revenue-source">
              <Input
                id="revenue-source"
                value={revenueSource}
                onChange={(e) => setRevenueSource(e.target.value)}
                placeholder="e.g., Ads + Subs"
              />
            </CustomField>
          </div>

          <CustomField label="License terms" htmlFor="license-terms">
            <Textarea
              id="license-terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g., 12 months, exclusive, territory: APAC…"
              rows={2}
              className="resize-none"
            />
          </CustomField>

          <p className="text-muted-foreground text-xs">
            Saved to <code>content_licenses</code> (cost / revenue / renewal → ROI) and the{" "}
            <code>contents</code> license chip; expiry drives the renewal alerts.
          </p>
        </CardContent>
      )}
    </GlassCard>
  );
}
