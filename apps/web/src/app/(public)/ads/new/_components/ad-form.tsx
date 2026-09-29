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

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

import { GlassCard } from "../../../games/_components/glass-card";
import { type AdItem, CTA_LABELS } from "../../constants";
import { type AdVideo, AdVideoUpload, EMPTY_VIDEO } from "./ad-video-upload";

type Errors = Partial<Record<"name" | "advertiser" | "video" | "ctaUrl" | "frequency" | "regions" | "dates", string>>;

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
  const [video, setVideo] = useState<AdVideo>(
    initial
      ? { state: "ready", src: initial.videoUrl ?? null, fileName: "current-video.mp4", durationSecs: initial.durationSecs, progress: 100 }
      : EMPTY_VIDEO,
  );
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? CTA_LABELS[0]!);
  const [ctaUrl, setCtaUrl] = useState(initial?.ctaUrl ?? "");
  const [frequency, setFrequency] = useState(String(initial?.frequency ?? 8));
  const [regions, setRegions] = useState<"all" | MacroRegion[]>(initial?.regions ?? "all");
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? dates.start);
  const [endsAt, setEndsAt] = useState(initial?.endsAt ?? dates.end);
  const [errors, setErrors] = useState<Errors>({});

  const toggleRegion = (code: MacroRegion) => {
    const list = regions === "all" ? [] : regions;
    setRegions(list.includes(code) ? list.filter((r) => r !== code) : [...list, code]);
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Enter a name";
    if (!advertiser.trim()) e.advertiser = "Enter the advertiser";
    // an existing ad keeps its current video; a new one needs a finished upload
    if (video.state !== "ready") e.video = video.state === "uploading" ? "Wait for the upload to finish" : "Upload a video";
    if (!URL_RE.test(ctaUrl.trim())) e.ctaUrl = "Enter an https:// link or an app link";
    const f = Number(frequency);
    if (!Number.isInteger(f) || f < 1) e.frequency = "Enter a whole number of 1 or more";
    if (regions !== "all" && regions.length === 0) e.regions = "Pick at least one region";
    if (!startsAt || !endsAt) e.dates = "Pick a start and end date";
    else if (new Date(endsAt) <= new Date(startsAt)) e.dates = "End must be after the start";
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
          <Field label="Frequency" htmlFor="ad-frequency" error={errors.frequency}>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show after every</span>
              <Input id="ad-frequency" type="number" min={1} value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-20" />
              <span className="text-muted-foreground">reels</span>
            </div>
          </Field>
          <Field label="Regions" error={errors.regions}>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <CheckItem id="region-all" label="All regions" checked={regions === "all"} onChange={() => setRegions(regions === "all" ? [] : "all")} />
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
