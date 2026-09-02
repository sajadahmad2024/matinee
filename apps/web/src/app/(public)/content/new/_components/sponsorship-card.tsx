"use client";

import { useState } from "react";

import { Megaphone, Timer } from "lucide-react";

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

import { GlassCard } from "../../../games/_components/glass-card";
import { BannerUpload } from "../../../games/format/_components/shared/banner-upload";

// Platform-level commercials (feed-inserted Ad-Sales spots) were removed from the
// per-video form — they belong to the platform-level Ad Sales home (future
// Dashboard/Monetization phase), not to a single video's monetization.
type AdFormat = "organic" | "sponsored";

type AdPlacement = "pre-roll" | "icon-overlay";

/**
 * Ad-Sales format for a piece of content:
 *  - organic:    no sponsor.
 *  - sponsored:  content carrying a sponsor logo + a sponsor ad (pre-roll or icon overlay).
 */
export function SponsorshipCard() {
  const [format, setFormat] = useState<AdFormat>("organic");
  const [advertiser, setAdvertiser] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [placement, setPlacement] = useState<AdPlacement>("pre-roll");
  // Pre-roll runs for seconds per play; icon overlay runs for the days of the deal.
  const [adDurationSecs, setAdDurationSecs] = useState("15");
  const [overlayDays, setOverlayDays] = useState("30");

  const showFields = format === "sponsored";
  const isOverlay = placement === "icon-overlay";

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2 text-base">
          <Megaphone className="text-featured h-4 w-4" /> Ad Sales &amp; Sponsorship
        </CardTitle>
        <CardDescription>
          Mark content as sponsored — a &ldquo;Sponsored by&rdquo; logo plus a pre-roll ad or an
          icon overlay on the video.
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
              <SelectItem value="sponsored">Sponsored — sponsor logo + ad</SelectItem>
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Placement</Label>
                <Select value={placement} onValueChange={(v) => setPlacement(v as AdPlacement)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card z-50">
                    <SelectItem value="pre-roll">Pre-roll (before video)</SelectItem>
                    <SelectItem value="icon-overlay">Icon Overlay (on video)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isOverlay ? (
                <div className="space-y-2">
                  <Label htmlFor="overlay-days" className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" />
                    Overlay duration (days)
                  </Label>
                  <Input
                    id="overlay-days"
                    type="number"
                    min={1}
                    value={overlayDays}
                    onChange={(e) => setOverlayDays(e.target.value)}
                    placeholder="30"
                  />
                  <p className="text-muted-foreground text-xs">
                    Length of the sponsorship deal — the overlay stays on the video for this
                    many days.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="ad-duration" className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" />
                    Ad duration (seconds)
                  </Label>
                  <Input
                    id="ad-duration"
                    type="number"
                    min={0}
                    value={adDurationSecs}
                    onChange={(e) => setAdDurationSecs(e.target.value)}
                    placeholder="15"
                  />
                </div>
              )}
            </div>

            <p className="text-muted-foreground text-xs">
              Revenue tracking and billing are settled by the Ad-Sales ledger.
            </p>
          </>
        )}
      </CardContent>
    </GlassCard>
  );
}
