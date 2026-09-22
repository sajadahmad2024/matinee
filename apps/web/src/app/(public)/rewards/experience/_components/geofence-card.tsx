"use client";

import { Globe, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { COUNTRIES } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

import { flagEmoji } from "../../constants";

export interface GeofenceEntry {
  code: string; // ISO country code
  live: boolean; // market enabled — distinct from selection
}

interface GeofenceCardProps {
  geofence: GeofenceEntry[];
  onChange: (next: GeofenceEntry[]) => void;
}

const countryLabel = (code: string) => COUNTRIES.find((c) => c.code === code)?.label ?? code;

// Same interaction pattern as content's distribution region list: vertical rows,
// per-row live/off toggle with a status dot, and a remove icon.
export function GeofenceCard({ geofence, onChange }: GeofenceCardProps) {
  const available = COUNTRIES.filter((c) => !geofence.some((g) => g.code === c.code));

  const setLive = (code: string, live: boolean) =>
    onChange(geofence.map((g) => (g.code === code ? { ...g, live } : g)));

  const remove = (code: string) => onChange(geofence.filter((g) => g.code !== code));

  const add = (code: string) => onChange([...geofence, { code, live: false }]);

  const liveCount = geofence.filter((g) => g.live).length;

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="text-success h-4 w-4" /> Region &amp; compliance
        </CardTitle>
        <CardDescription>
          Bidding legality varies by country — confirm legal clearance before enabling a market.
          First launch: UK.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {geofence.length === 0 ? (
          <p className="text-muted-foreground text-sm">No markets selected yet.</p>
        ) : (
          <div className="space-y-2">
            {geofence.map((g) => (
              <div
                key={g.code}
                className="border-border/50 bg-muted/10 flex items-center gap-3 rounded-lg border px-3 py-2">
                <span className="text-base leading-none">{flagEmoji(g.code)}</span>
                <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                  {countryLabel(g.code)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      g.live ? "bg-success" : "bg-destructive",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      g.live ? "text-success" : "text-destructive",
                    )}>
                    {g.live ? "Live" : "Off"}
                  </span>
                  <Switch
                    checked={g.live}
                    onCheckedChange={(v) => setLive(g.code, v)}
                    aria-label={`Toggle ${countryLabel(g.code)} live`}
                  />
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-7 w-7"
                  onClick={() => remove(g.code)}
                  aria-label={`Remove ${countryLabel(g.code)}`}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {available.length > 0 && (
          <div className="flex items-center gap-2">
            <Plus className="text-muted-foreground h-4 w-4" />
            <Select value="" onValueChange={add}>
              <SelectTrigger className="bg-background/50 w-[220px]">
                <SelectValue placeholder="Add country" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {available.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {flagEmoji(c.code)} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <p className="text-muted-foreground text-xs">
          Live in {liveCount} of {geofence.length} selected {geofence.length === 1 ? "market" : "markets"}.
        </p>
      </CardContent>
    </GlassCard>
  );
}
