"use client";

import { useState } from "react";

import { MonitorPlay, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

/** Consumer-app "where to watch" CTA — admins configure the destination at publish time
 *  (spec-05 §1.4). Platform alone is renderable ("Find it on Netflix"); the URL is optional
 *  because deep links are not always available. Mock state only. */
const WATCH_PLATFORMS = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Apple TV",
  "In cinemas",
  "Other",
] as const;

const WATCH_PLATFORM_OPTIONS: CustomSelectOption[] = WATCH_PLATFORMS.map((p) => ({
  value: p,
  label: p,
}));

const GENRE_OPTIONS: CustomSelectOption[] = [
  { value: "drama", label: "Drama" },
  { value: "action", label: "Action" },
  { value: "romance", label: "Romance" },
  { value: "comedy", label: "Comedy" },
  { value: "thriller", label: "Thriller" },
  { value: "documentary", label: "Documentary" },
];

const MAX_WATCH_LINKS = 3;

interface WatchLinkDraft {
  platform: string;
  url: string;
  /** free text when platform === "Other" */
  custom: string;
}

interface VideoDetailsCardProps {
  title: string;
  setTitle: (val: string) => void;
  studioName: string;
  setStudioName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  genre: string;
  setGenre: (val: string) => void;
  tags: string;
  setTags: (val: string) => void;
  cast: string[];
  newCast: string;
  setNewCast: (val: string) => void;
  onAddCast: () => void;
  onRemoveCast: (index: number) => void;
}

export function VideoDetailsCard({
  title,
  setTitle,
  studioName,
  setStudioName,
  description,
  setDescription,
  genre,
  setGenre,
  tags,
  setTags,
  cast,
  newCast,
  setNewCast,
  onAddCast,
  onRemoveCast,
}: VideoDetailsCardProps) {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground">Video Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <CustomField label="Video Title" htmlFor="title">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
            />
          </CustomField>
          <CustomField label="Studio Name" htmlFor="studio">
            <Input
              id="studio"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              placeholder="Production studio"
            />
          </CustomField>
        </div>

        <CustomField label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your video..."
            rows={4}
            className="resize-none"
          />
        </CustomField>

        <div className="grid gap-4 md:grid-cols-2">
          <CustomField label="Genre" htmlFor="genre">
            <CustomSelect
              id="genre"
              options={GENRE_OPTIONS}
              value={genre}
              onValueChange={setGenre}
              placeholder="Select genre"
            />
          </CustomField>
          <CustomField label="Tags (comma separated)" htmlFor="tags">
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="action, drama, thriller"
            />
          </CustomField>
        </div>

        {/* Cast */}
        <CustomField label="Cast / Actors">
          <div className="mb-2 flex flex-wrap gap-2">
            {cast.map((actor, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {actor}
                <button
                  type="button"
                  onClick={() => onRemoveCast(index)}
                  aria-label={`Remove ${actor}`}
                  className="hover:text-destructive ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCast}
              onChange={(e) => setNewCast(e.target.value)}
              placeholder="Add actor name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddCast();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onAddCast}
              aria-label="Add cast member">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CustomField>

        <WhereToWatchField />
      </CardContent>
    </GlassCard>
  );
}

function WhereToWatchField() {
  const [links, setLinks] = useState<WatchLinkDraft[]>([]);

  const add = () =>
    setLinks((l) =>
      l.length >= MAX_WATCH_LINKS ? l : [...l, { platform: "Netflix", url: "", custom: "" }],
    );
  const update = (i: number, patch: Partial<WatchLinkDraft>) =>
    setLinks((l) => l.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const remove = (i: number) => setLinks((l) => l.filter((_, idx) => idx !== i));

  return (
    <div className="border-border/40 space-y-2 border-t pt-4">
      <Label className="flex items-center gap-2">
        <MonitorPlay className="text-muted-foreground h-4 w-4" />
        Where to watch
      </Label>
      <p className="text-muted-foreground text-xs">
        Shown as a call-to-action on the video in the app (&ldquo;Find it on Netflix&rdquo;). URL is
        optional — the platform name alone still renders. Up to {MAX_WATCH_LINKS}.
      </p>

      {links.length === 0 && (
        <p className="text-muted-foreground text-xs italic">No watch destinations configured.</p>
      )}

      {links.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <CustomSelect
            options={WATCH_PLATFORM_OPTIONS}
            value={row.platform}
            onValueChange={(v) => update(i, { platform: v })}
            triggerClassName="w-[160px]"
            aria-label="Watch platform"
          />

          {row.platform === "Other" && (
            <Input
              value={row.custom}
              onChange={(e) => update(i, { custom: e.target.value })}
              placeholder="Platform name"
              className="w-40"
            />
          )}

          <Input
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://… (optional)"
            className="min-w-50 flex-1"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove destination"
            onClick={() => remove(i)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {links.length < MAX_WATCH_LINKS && (
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={add}>
          <Plus className="h-4 w-4" /> Add destination
        </Button>
      )}
    </div>
  );
}
