"use client";

import { useState } from "react";

import { Flag } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// Mirrors app_settings (category='feature_flag' + a few security toggles).
const INITIAL_FLAGS = [
  { key: "feature.games_enabled", label: "Game Centre", description: "Master switch for all games", on: true },
  { key: "feature.subscriptions_enabled", label: "Subscriptions", description: "Paywall + plans", on: true },
  { key: "feature.shared_content_enabled", label: "Shared Content earning", description: "Points for sharing/referrals", on: true },
  { key: "feature.predictions_enabled", label: "Predictive games", description: "Spend points to predict", on: true },
  { key: "feature.ad_commercials_enabled", label: "Ad-Sales commercials", description: "Insert commercials in the feed", on: false },
  { key: "security.require_2fa_for_admins", label: "Require 2FA for admins", description: "Force MFA on all admin accounts", on: true },
];

export function FeatureFlagsSettings() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);

  const toggle = (key: string) => {
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, on: !f.on } : f)));
    const f = flags.find((x) => x.key === key);
    toast.success(`${f?.label} ${f?.on ? "disabled" : "enabled"}`);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flag className="text-primary h-4 w-4" /> Feature flags
        </CardTitle>
        <CardDescription>Toggle platform features without a deploy. Saved to app_settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {flags.map((f) => (
          <div key={f.key} className="border-border/40 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-foreground text-sm font-medium">{f.label}</p>
              <p className="text-muted-foreground text-xs">{f.description}</p>
              <code className="text-muted-foreground text-[10px]">{f.key}</code>
            </div>
            <Switch checked={f.on} onCheckedChange={() => toggle(f.key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
