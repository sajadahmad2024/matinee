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

type AdFormat = "organic" | "sponsored" | "commercial";

/**
 * Ad-Sales format for a piece of content:
 *  - organic:     no sponsor.
 *  - sponsored:   normal content carrying a sponsor logo + a sponsor ad (pre/mid/post-roll).
 *  - commercial:  the content IS an Ad-Sales commercial inserted into the swipe feed.
 */
export function SponsorshipCard() {
  const [format, setFormat] = useState<AdFormat>("organic");
  const [advertiser, setAdvertiser] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [adDuration, setAdDuration] = useState("15");
  const [placement, setPlacement] = useState("pre-roll");
  const [feedFrequency, setFeedFrequency] = useState("8"); // insert every N videos in the feed

  const showFields = format !== "organic";
  const isCommercial = format === "commercial";

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2 text-base">
          <Megaphone className="text-featured h-4 w-4" /> Ad-Sales &amp; Sponsorship
        </CardTitle>
        <CardDescription>
          Mark content as sponsored (shows a “Sponsored by” logo) or as an Ad-Sales commercial
          inserted into the swipe feed.
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
              <SelectItem value="commercial">Ad-Sales commercial — inserted in feed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFields && (
          <>
            <div className="space-y-2">
              <Label htmlFor="advertiser">{isCommercial ? "Advertiser / Brand" : "Sponsor / Brand"}</Label>
              <Input
                id="advertiser"
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
                placeholder="e.g. Nike, Coca-Cola"
              />
            </div>

            <div className="space-y-2">
              <Label>{isCommercial ? "Commercial banner / logo" : "Sponsor banner / logo"}</Label>
              <BannerUpload
                value={banner}
                onChange={setBanner}
                aspect="aspect-[16/6]"
                hint="16:6 · the “Sponsored by” logo/banner shown on the content"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ad-duration" className="flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  {isCommercial ? "Commercial length (s)" : "Ad duration (s)"}
                </Label>
                <Input
                  id="ad-duration"
                  type="number"
                  min={0}
                  value={adDuration}
                  onChange={(e) => setAdDuration(e.target.value)}
                  placeholder="15"
                />
              </div>

              {isCommercial ? (
                <div className="space-y-2">
                  <Label htmlFor="feed-frequency">Insert every N videos</Label>
                  <Input
                    id="feed-frequency"
                    type="number"
                    min={1}
                    value={feedFrequency}
                    onChange={(e) => setFeedFrequency(e.target.value)}
                    placeholder="8"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Placement</Label>
                  <Select value={placement} onValueChange={setPlacement}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card z-50">
                      <SelectItem value="pre-roll">Pre-roll (before video)</SelectItem>
                      <SelectItem value="mid-roll">Mid-roll (during)</SelectItem>
                      <SelectItem value="post-roll">Post-roll (after)</SelectItem>
                      <SelectItem value="overlay">Banner overlay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <p className="text-muted-foreground text-xs">
              {isCommercial
                ? "Commercials are inserted into the swipe feed at the chosen frequency with a countdown timer. Revenue is settled by the Ad-Sales ledger."
                : "Revenue tracking and billing are settled by the Ad-Sales ledger."}
            </p>
          </>
        )}
      </CardContent>
    </GlassCard>
  );
}
