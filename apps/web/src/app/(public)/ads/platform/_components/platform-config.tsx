"use client";

import { useState } from "react";

import { Megaphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { GlassCard } from "../../../games/_components/glass-card";
import { DEFAULT_PLATFORM_SETTINGS, type PlatformAdSettings } from "../../constants";

type NumberKey = Exclude<keyof PlatformAdSettings, "adsEnabled">;

// Whole-number rules from spec-09 §3.
const RULES: Record<NumberKey, { min: number; max?: number; message: string }> = {
  firstAdAfter: { min: 0, message: "Enter a whole number of 0 or more" },
  adEvery: { min: 2, message: "Enter a whole number of 2 or more" },
  maxAdsPerUserDay: { min: 1, message: "Enter a whole number of 1 or more" },
  newUserGraceDays: { min: 0, message: "Enter a whole number of 0 or more" },
};

type Draft = Record<NumberKey, string>;

const toDraft = (s: PlatformAdSettings): Draft => ({
  firstAdAfter: String(s.firstAdAfter),
  adEvery: String(s.adEvery),
  maxAdsPerUserDay: String(s.maxAdsPerUserDay),
  newUserGraceDays: String(s.newUserGraceDays),
});

function errorFor(key: NumberKey, raw: string): string | undefined {
  const { min, max, message } = RULES[key];
  const n = Number(raw);
  const ok = raw.trim() !== "" && Number.isInteger(n) && n >= min && (max === undefined || n <= max);
  return ok ? undefined : message;
}

/** Configuration tab: master switch, placement rules, defaults for new ads. UI-only (mock). */
export function PlatformConfig() {
  const [saved, setSaved] = useState<PlatformAdSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_PLATFORM_SETTINGS));
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  const set = (key: keyof Draft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const errors = Object.fromEntries(
    (Object.keys(RULES) as NumberKey[]).map((k) => [k, errorFor(k, draft[k])]),
  ) as Partial<Record<NumberKey, string>>;
  const valid = Object.values(errors).every((e) => !e);
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(saved));

  // the master switch applies straight away (with a warning when turning ads off)
  const onToggleAds = (on: boolean) => {
    if (!on) return setConfirmDisable(true);
    setSaved((s) => ({ ...s, adsEnabled: true }));
    toast.success("Ads enabled");
  };

  const save = () => {
    setSaved((s) => ({
      ...s,
      firstAdAfter: Number(draft.firstAdAfter),
      adEvery: Number(draft.adEvery),
      maxAdsPerUserDay: Number(draft.maxAdsPerUserDay),
      newUserGraceDays: Number(draft.newUserGraceDays),
    }));
    setConfirmSave(false);
    toast.success("Platform ad settings saved");
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Master controls */}
      <GlassCard>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <Megaphone className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Ads enabled</CardTitle>
                <p className="text-muted-foreground text-sm">
                  When off, no ads show anywhere in the app.
                </p>
              </div>
            </div>
            <Switch checked={saved.adsEnabled} onCheckedChange={onToggleAds} />
          </div>
        </CardHeader>
      </GlassCard>

      {/* Placement and frequency */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Placement and frequency</CardTitle>
          <p className="text-muted-foreground text-sm">Decides which feed slots become ads.</p>
        </CardHeader>
        <CardContent className="space-y-1">
          <NumberRow
            id="first-ad-after"
            label="Show first ad after"
            unit="videos"
            value={draft.firstAdAfter}
            onChange={set("firstAdAfter")}
            error={errors.firstAdAfter}
          />
          <NumberRow
            id="ad-every"
            label="Show an ad every"
            hint="Minimum 2, so ads are never back to back."
            unit="videos"
            value={draft.adEvery}
            onChange={set("adEvery")}
            error={errors.adEvery}
          />
          <NumberRow
            id="max-per-day"
            label="Max ads per user per day"
            unit="ads"
            value={draft.maxAdsPerUserDay}
            onChange={set("maxAdsPerUserDay")}
            error={errors.maxAdsPerUserDay}
          />
          <NumberRow
            id="new-user-grace"
            label="No ads for new users"
            hint="Protects first impressions. 0 turns it off."
            unit="days"
            value={draft.newUserGraceDays}
            onChange={set("newUserGraceDays")}
            error={errors.newUserGraceDays}
          />
          {valid && (
            <div className="bg-primary/10 border-primary/20 mt-3 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Current pattern:</strong> first ad after video{" "}
                {draft.firstAdAfter}, then an ad after every {draft.adEvery} videos. Up to{" "}
                {draft.maxAdsPerUserDay} ads per user per day
                {Number(draft.newUserGraceDays) > 0 &&
                  `, none in a user's first ${draft.newUserGraceDays} days`}
                .
              </p>
            </div>
          )}
        </CardContent>
      </GlassCard>


      <div className="flex justify-end gap-2">
        <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(toDraft(saved))}>
          Cancel
        </Button>
        <Button disabled={!dirty || !valid} onClick={() => setConfirmSave(true)}>
          Save changes
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmDisable}
        onOpenChange={setConfirmDisable}
        title="Turn off all ads?"
        description={
          <>
            <span className="text-warning font-medium">Warning:</span> No ads will show anywhere
            in the app until they are turned back on. Campaigns keep their schedules.
          </>
        }
        onConfirm={() => {
          setSaved((s) => ({ ...s, adsEnabled: false }));
          setConfirmDisable(false);
          toast.success("Ads turned off");
        }}
        action="warn"
        confirmLabel="Turn off ads"
      />

      <ConfirmationDialog
        open={confirmSave}
        onOpenChange={setConfirmSave}
        title="Save platform ad settings?"
        description="These settings affect every user and every feed ad."
        onConfirm={save}
        action="custom"
        confirmLabel="Save changes"
      />
    </div>
  );
}

function Row({
  label,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border/30 flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>}
      </div>
      <div className="flex flex-col items-start gap-1 sm:items-end">
        {children}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    </div>
  );
}

function NumberRow({
  id,
  label,
  hint,
  unit,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  hint?: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <Row label={label} hint={hint} htmlFor={id} error={error}>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className="bg-background/50 w-24"
        />
        <span className="text-muted-foreground w-14 text-sm">{unit}</span>
      </div>
    </Row>
  );
}
