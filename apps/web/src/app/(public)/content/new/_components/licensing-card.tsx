"use client";

import { useState } from "react";

import { ScrollText } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { GlassCard } from "../../../games/_components/glass-card";

type LicenseType = "original" | "licensed";

const RENEWAL_OPTIONS = [
  { value: "renewing", label: "Renewing" },
  { value: "in_negotiation", label: "In negotiation" },
  { value: "expiring", label: "Expiring (not renewing)" },
  { value: "auto_renew", label: "Auto-renew" },
  { value: "lapsed", label: "Lapsed" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "BRL", "AED"];

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
          <Select value={licenseType} onValueChange={(v) => setLicenseType(v as LicenseType)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card z-50">
              <SelectItem value="original">Original / owned</SelectItem>
              <SelectItem value="licensed">Licensed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {licensed && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="licensor">Licensor / rights holder</Label>
              <Input
                id="licensor"
                value={licensor}
                onChange={(e) => setLicensor(e.target.value)}
                placeholder="e.g., Global Rights Co"
              />
            </div>
            <div className="space-y-2">
              <Label>Renewal status</Label>
              <Select value={renewal} onValueChange={setRenewal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card z-50">
                  {RENEWAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="license-start">License start</Label>
              <Input
                id="license-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license-expiry">License expiry</Label>
              <Input
                id="license-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="license-cost">License cost</Label>
              <Input
                id="license-cost"
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card z-50">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue-source">Revenue source</Label>
              <Input
                id="revenue-source"
                value={revenueSource}
                onChange={(e) => setRevenueSource(e.target.value)}
                placeholder="e.g., Ads + Subs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license-terms">License terms</Label>
            <Textarea
              id="license-terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g., 12 months, exclusive, territory: APAC…"
              rows={2}
              className="resize-none"
            />
          </div>

          <p className="text-muted-foreground text-xs">
            Saved to <code>content_licenses</code> (cost / revenue / renewal → ROI) and the{" "}
            <code>contents</code> license chip; expiry drives the renewal alerts.
          </p>
        </CardContent>
      )}
    </GlassCard>
  );
}
