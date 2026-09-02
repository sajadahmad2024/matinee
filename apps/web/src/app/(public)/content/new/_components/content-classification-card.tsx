"use client";

import { useState } from "react";

import { Clapperboard, Film, Globe, Link2, Lock, Plus, Video, X } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

import { cn } from "@/app/_libs/utils/cn";
import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

import { GlassCard } from "../../../games/_components/glass-card";
import { MOCK_VIDEOS } from "../../constants";

const CONTENT_TYPES = [
  { value: "trailer", label: "Trailer", icon: Clapperboard, hint: "Primary promotional video" },
  { value: "bts", label: "Behind the Scenes (BTS)", icon: Video, hint: "A standalone extra — may optionally belong to a title" },
  { value: "clip", label: "Clip", icon: Film, hint: "Short clip — may optionally belong to a title" },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]["value"];

/** A region selected for publish; `live` is distinct from selection — a region can be
 *  selected but paused (Off) without unselecting it. */
interface PublishRegion {
  code: MacroRegion;
  live: boolean;
}

/**
 * Content classification: every type (trailer / BTS / clip) is first-class content.
 * Exclusivity is a content-level property (any type can be exclusive). A BTS/clip MAY
 * optionally belong to one primary title — no content requires a BTS.
 */
export function ContentClassificationCard() {
  const [contentType, setContentType] = useState<ContentType>("trailer");
  const [exclusive, setExclusive] = useState(false);
  const [unlockPoints, setUnlockPoints] = useState(100);
  const [parentId, setParentId] = useState("none");
  const [language, setLanguage] = useState("en");
  const [rightsRegion, setRightsRegion] = useState("global");
  const [recommendation, setRecommendation] = useState("normal");
  // Publish/availability regions (multi) — distinct from rights region. Default: everywhere, live.
  const [publishRegions, setPublishRegions] = useState<PublishRegion[]>(
    MACRO_REGIONS.map((r) => ({ code: r.code, live: true })),
  );

  const allRegions = publishRegions.length === MACRO_REGIONS.length;
  const addRegion = (code: MacroRegion) =>
    setPublishRegions((prev) => [...prev, { code, live: true }]);
  const removeRegion = (code: MacroRegion) =>
    setPublishRegions((prev) => prev.filter((r) => r.code !== code));
  const setRegionLive = (code: MacroRegion, live: boolean) =>
    setPublishRegions((prev) => prev.map((r) => (r.code === code ? { ...r, live } : r)));
  const toggleAll = () =>
    setPublishRegions(allRegions ? [] : MACRO_REGIONS.map((r) => ({ code: r.code, live: true })));

  const unselectedRegions = MACRO_REGIONS.filter(
    (r) => !publishRegions.some((p) => p.code === r.code),
  );
  const liveCount = publishRegions.filter((r) => r.live).length;

  const canHaveParent = contentType === "bts" || contentType === "clip";
  // Candidate primary titles (a BTS/clip belongs to a trailer/primary title, not another extra)
  const parentCandidates = MOCK_VIDEOS;

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground">Classification</CardTitle>
        <CardDescription>
          Type, access tier and (optionally) the title this content belongs to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Content type */}
        <div className="space-y-2">
          <Label>Content type</Label>
          <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card z-50">
              {CONTENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <span className="flex items-center gap-2">
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            {CONTENT_TYPES.find((t) => t.value === contentType)?.hint}
          </p>
        </div>

        {/* Metadata & distribution */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rights region</Label>
            <Select value={rightsRegion} onValueChange={setRightsRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="global">Global</SelectItem>
                {MACRO_REGIONS.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Recommendation</Label>
            <Select value={recommendation} onValueChange={setRecommendation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="promoted">Promoted</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="deprioritized">Deprioritized</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Publish to regions (multi-select availability — where users can see this) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Publish to regions
            </Label>
            <button
              type="button"
              onClick={toggleAll}
              className="text-primary text-xs hover:underline">
              {allRegions ? "Clear all" : "Select all"}
            </button>
          </div>
          {/* Vertical region list — live/off is distinct from selection: launch in 5,
              later pause 2 without unselecting them. */}
          <div className="space-y-1.5">
            {publishRegions.map((pr) => {
              const region = MACRO_REGIONS.find((r) => r.code === pr.code);
              if (!region) return null;
              return (
                <div
                  key={pr.code}
                  className="border-border/50 bg-card/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <span className="text-foreground text-sm font-medium">{region.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          pr.live ? "bg-success" : "bg-destructive",
                        )}
                      />
                      <span className={pr.live ? "text-success" : "text-destructive"}>
                        {pr.live ? "Live" : "Off"}
                      </span>
                    </span>
                    <Switch
                      checked={pr.live}
                      onCheckedChange={(checked) => setRegionLive(pr.code, checked)}
                    />
                    <button
                      type="button"
                      onClick={() => removeRegion(pr.code)}
                      aria-label={`Remove ${region.label}`}
                      className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {publishRegions.length === 0 && (
              <p className="text-destructive text-xs">
                No regions selected — content won&apos;t be visible to anyone.
              </p>
            )}
          </div>

          {/* Unselected regions — quick add */}
          {unselectedRegions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs">Add region:</span>
              {unselectedRegions.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => addRegion(r.code)}
                  className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors">
                  <Plus className="h-3 w-3" />
                  {r.label}
                </button>
              ))}
            </div>
          )}

          <p className="text-muted-foreground text-xs">
            {publishRegions.length === 0
              ? "No regions selected."
              : `Live in ${liveCount} of ${publishRegions.length} selected region${publishRegions.length > 1 ? "s" : ""}.`}{" "}
            Distinct from Rights region (above), which is the licensing focus.
          </p>
        </div>

        {/* Optional primary title (BTS / clip only) */}
        {canHaveParent && (
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" /> Belongs to (primary title)
            </Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="none">None — standalone</SelectItem>
                {parentCandidates.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Optional. Link this {contentType === "bts" ? "BTS" : "clip"} to a title, or leave
              it standalone.
            </p>
          </div>
        )}

        {/* Exclusivity (content-level; any type) */}
        <div className="border-border/50 space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Exclusive content
              </Label>
              <p className="text-muted-foreground text-xs">
                Lock behind points — viewers spend points to unlock. Applies to any type.
              </p>
            </div>
            <Switch checked={exclusive} onCheckedChange={setExclusive} />
          </div>
          {exclusive && (
            <div className="space-y-2">
              <Label htmlFor="unlock-points">Unlock cost (points)</Label>
              <Input
                id="unlock-points"
                type="number"
                min={0}
                value={unlockPoints}
                onChange={(e) => setUnlockPoints(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
