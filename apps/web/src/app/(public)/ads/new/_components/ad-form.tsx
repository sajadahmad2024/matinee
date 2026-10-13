"use client";

import { useState } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

import { GlassCard } from "@/components/custom/glass-card";
import {
  AD_CAPTION_MAX,
  AD_RANK_MAX,
  type AdItem,
  adRegions,
  CTA_LABELS,
  fmtDateRange,
  MOCK_ADS,
  nextFreeRank,
  rankBookings,
  rankHolder,
} from "../../constants";
import { AdStatusBadge } from "../../_components/ad-status-badge";
import { type AdVideo, AdVideoUpload, EMPTY_VIDEO } from "./ad-video-upload";

type Errors = Partial<
  Record<"name" | "advertiser" | "caption" | "video" | "ctaUrl" | "regions" | "dates" | "ranks", string>
>;

type RankDrafts = Partial<Record<MacroRegion, string>>;

const isRank = (raw: string) => {
  const n = Number(raw);
  return raw.trim() !== "" && Number.isInteger(n) && n >= 1 && n <= AD_RANK_MAX;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

function defaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  end.setHours(23, 59, 0, 0);
  return { start: toInput(start), end: toInput(end) };
}

const URL_RE = /^(https:\/\/\S+\.\S+|[a-z][a-z0-9+.-]*:\/\/\S+)$/i;

/** One-page create/edit form: Ad · Delivery · Schedule. */
export function AdForm({ initial }: { initial?: AdItem }) {
  const router = useRouter();
  const dates = defaultDates();

  const [name, setName] = useState(initial?.name ?? "");
  const [advertiser, setAdvertiser] = useState(initial?.advertiser ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [video, setVideo] = useState<AdVideo>(
    initial
      ? { state: "ready", src: initial.videoUrl ?? null, fileName: "current-video.mp4", durationSecs: initial.durationSecs, progress: 100 }
      : EMPTY_VIDEO,
  );
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? CTA_LABELS[0]!);
  const [ctaUrl, setCtaUrl] = useState(initial?.ctaUrl ?? "");
  const [regions, setRegions] = useState<"all" | MacroRegion[]>(initial?.regions ?? []);
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? dates.start);
  const [endsAt, setEndsAt] = useState(initial?.endsAt ?? dates.end);
  const [errors, setErrors] = useState<Errors>({});

  // a newly targeted region starts on the next rank that is free for the chosen dates
  const fillRanks = (next: "all" | MacroRegion[], current: RankDrafts, from = startsAt, to = endsAt): RankDrafts => {
    const out: RankDrafts = {};
    for (const code of adRegions(next)) {
      const free = nextFreeRank(MOCK_ADS, code, from, to, initial?.id);
      out[code] = current[code] ?? (free ? String(free) : "");
    }
    return out;
  };
  const [ranks, setRanks] = useState<RankDrafts>(() =>
    initial
      ? Object.fromEntries(Object.entries(initial.ranks).map(([code, rank]) => [code, String(rank)]))
      : fillRanks(regions, {}, dates.start, dates.end),
  );

  const changeRegions = (next: "all" | MacroRegion[]) => {
    setRegions(next);
    setRanks((current) => fillRanks(next, current));
  };

  const toggleRegion = (code: MacroRegion) => {
    const list = regions === "all" ? [] : regions;
    changeRegions(list.includes(code) ? list.filter((r) => r !== code) : [...list, code]);
  };

  const holderOf = (code: MacroRegion, raw: string) =>
    isRank(raw) ? rankHolder(MOCK_ADS, code, Number(raw), startsAt, endsAt, initial?.id) : undefined;

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Enter a name";
    if (!advertiser.trim()) e.advertiser = "Enter the advertiser";
    if (caption.length > AD_CAPTION_MAX) e.caption = `Keep the caption under ${AD_CAPTION_MAX} characters`;
    // an existing ad keeps its current video; a new one needs a finished upload
    if (video.state !== "ready") e.video = video.state === "uploading" ? "Wait for the upload to finish" : "Upload a video";
    if (!URL_RE.test(ctaUrl.trim())) e.ctaUrl = "Enter an https:// link or an app link";
    if (regions !== "all" && regions.length === 0) e.regions = "Pick at least one region";
    if (!startsAt || !endsAt) e.dates = "Pick a start and end date";
    else if (new Date(endsAt) <= new Date(startsAt)) e.dates = "End must be after the start";
    const rankOk = adRegions(regions).every((code) => {
      const raw = ranks[code] ?? "";
      return isRank(raw) && !holderOf(code, raw);
    });
    if (!rankOk) e.ranks = "Fix the rank for each region";
    return e;
  };

  const save = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Fix the highlighted fields");
      return;
    }
    const scheduled = new Date(startsAt) > new Date();
    toast.success(initial ? "Ad updated" : scheduled ? "Ad scheduled" : "Ad is live");
    router.push((initial ? `/ads/${initial.id}` : "/ads") as Route);
  };

  const back = (initial ? `/ads/${initial.id}` : "/ads") as Route;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={() => router.push(back)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-gaming text-foreground text-2xl font-bold">{initial ? "Edit Ad" : "New Ad"}</h1>
      </div>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Ad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="ad-name" error={errors.name}>
              <Input id="ad-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Air Max Day" />
            </Field>
            <Field label="Advertiser" htmlFor="ad-advertiser" error={errors.advertiser}>
              <Input id="ad-advertiser" value={advertiser} onChange={(e) => setAdvertiser(e.target.value)} placeholder="e.g. Nike" />
            </Field>
          </div>
          <Field label="Caption" htmlFor="ad-caption" error={errors.caption}>
            <Textarea
              id="ad-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Shown under the ad in the feed"
              rows={3}
              maxLength={AD_CAPTION_MAX}
              className="resize-none"
            />
            <p className="text-muted-foreground text-right text-xs">
              {caption.length}/{AD_CAPTION_MAX}
            </p>
          </Field>
          <Field label="Video" error={errors.video}>
            <AdVideoUpload value={video} onChange={setVideo} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <Field label="Button">
              <Select value={ctaLabel} onValueChange={setCtaLabel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card z-50">
                  {CTA_LABELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Button link" htmlFor="ad-cta-url" error={errors.ctaUrl}>
              <Input id="ad-cta-url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://brand.com/offer" />
            </Field>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Regions" error={errors.regions}>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <CheckItem id="region-all" label="All regions" checked={regions === "all"} onChange={() => changeRegions(regions === "all" ? [] : "all")} />
              {MACRO_REGIONS.map((r) => (
                <CheckItem
                  key={r.code}
                  id={`region-${r.code}`}
                  label={r.label}
                  disabled={regions === "all"}
                  checked={regions === "all" || regions.includes(r.code)}
                  onChange={() => toggleRegion(r.code)}
                />
              ))}
            </div>
          </Field>
          {adRegions(regions).length > 0 && (
            <Field label="Feed rank" error={errors.ranks}>
              <p className="text-muted-foreground text-xs">
                An ad shows after every 5 videos. Rank 1 is the first ad slot, rank 2 the second, up to {AD_RANK_MAX}.
              </p>
              <div className="divide-border/30 divide-y">
                {adRegions(regions).map((code) => (
                  <RankRow
                    key={code}
                    code={code}
                    value={ranks[code] ?? ""}
                    onChange={(v) => setRanks((r) => ({ ...r, [code]: v }))}
                    holder={holderOf(code, ranks[code] ?? "")}
                    noneFree={nextFreeRank(MOCK_ADS, code, startsAt, endsAt, initial?.id) === null}
                    showEmpty={!!errors.ranks}
                  />
                ))}
              </div>
              <RankBoard
                regions={adRegions(regions)}
                ranks={ranks}
                startsAt={startsAt}
                endsAt={endsAt}
                excludeId={initial?.id}
              />
            </Field>
          )}
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="" error={errors.dates}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ad-start">Start</Label>
                <Input id="ad-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-end">End</Label>
                <Input id="ad-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>
          </Field>
        </CardContent>
      </GlassCard>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push(back)}>
          Cancel
        </Button>
        <Button onClick={save}>{initial ? "Save changes" : "Save"}</Button>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

function RankRow({
  code,
  value,
  onChange,
  holder,
  noneFree,
  showEmpty,
}: {
  code: MacroRegion;
  value: string;
  onChange: (value: string) => void;
  holder?: AdItem;
  noneFree: boolean;
  showEmpty: boolean;
}) {
  const label = MACRO_REGIONS.find((r) => r.code === code)?.label ?? code;
  const id = `rank-${code}`;

  let status: { text: string; error: boolean } | null = null;
  if (value.trim() === "") {
    if (noneFree) status = { text: "No free rank for these dates. Change the dates or free a rank", error: true };
    else if (showEmpty) status = { text: "Enter a rank", error: true };
  } else if (!isRank(value)) {
    status = { text: `Enter a whole number from 1 to ${AD_RANK_MAX}`, error: true };
  } else if (holder) {
    status = {
      text: `Rank ${value} is held by ${holder.advertiser} — ${holder.name} (${fmtDateRange(holder.startsAt, holder.endsAt)}). Pick another rank or change the dates`,
      error: true,
    };
  } else {
    status = { text: `Rank ${value} is free for these dates`, error: false };
  }

  return (
    <div className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-start sm:justify-between">
      <Label htmlFor={id} className="pt-2 font-normal">
        Rank in {label}
      </Label>
      <div className="flex flex-col items-start gap-1 sm:max-w-xs sm:items-end">
        <Input
          id={id}
          type="number"
          min={1}
          max={AD_RANK_MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!status?.error}
          className="w-20"
        />
        {status && (
          <p className={`text-xs sm:text-right ${status.error ? "text-destructive" : "text-success"}`}>{status.text}</p>
        )}
      </div>
    </div>
  );
}

/** Who holds each rank in a region during this ad's dates, and where this ad would land. */
function RankBoard({
  regions,
  ranks,
  startsAt,
  endsAt,
  excludeId,
}: {
  regions: MacroRegion[];
  ranks: RankDrafts;
  startsAt: string;
  endsAt: string;
  excludeId?: string;
}) {
  const [picked, setPicked] = useState<MacroRegion | null>(null);
  const region = picked && regions.includes(picked) ? picked : regions[0];
  if (!region) return null;

  const mine = Number(ranks[region]);
  const label = (code: MacroRegion) => MACRO_REGIONS.find((r) => r.code === code)?.label ?? code;

  return (
    <div className="border-border/50 bg-background/30 mt-3 space-y-3 rounded-lg border p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">Ranks for these dates</p>
        {regions.length > 1 && (
          <Tabs value={region} onValueChange={(v) => setPicked(v as MacroRegion)}>
            <TabsList className="h-auto flex-wrap">
              {regions.map((code) => (
                <TabsTrigger key={code} value={code} className="cursor-pointer text-xs">
                  {code}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{label(region)}</p>
      <ul className="divide-border/30 divide-y">
        {rankBookings(MOCK_ADS, region, startsAt, endsAt, excludeId).map(({ rank, ads }) => {
          const isMine = mine === rank;
          return (
            <li key={rank} className="flex gap-3 py-2 text-sm">
              <span className="w-8 shrink-0 font-medium tabular-nums">#{rank}</span>
              <div className="min-w-0 flex-1 space-y-1">
                {ads.length === 0 && !isMine && <span className="text-success text-xs">Free</span>}
                {ads.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate">
                      {a.advertiser} — {a.name}
                    </span>
                    <span className="text-muted-foreground text-xs">{fmtDateRange(a.startsAt, a.endsAt)}</span>
                    <AdStatusBadge status={a.status} />
                  </div>
                ))}
                {isMine && (
                  <span className={`text-xs font-medium ${ads.length ? "text-destructive" : "text-primary"}`}>
                    {ads.length ? "This ad — clashes with the booking above" : "This ad"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CheckItem({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
