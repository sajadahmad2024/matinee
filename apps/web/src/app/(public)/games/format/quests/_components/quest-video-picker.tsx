"use client";

import { useState } from "react";

import { Check, Film } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { useAdminContentList } from "@/app/_libs/hooks/api/use-admin-content";
import { cn } from "@/app/_libs/utils/cn";
import { formatDuration } from "@/app/_libs/utils/format";
import { CustomSearch } from "@/components/custom/custom-search";

/** How many published videos the picker lists per search. */
const PICKER_LIMIT = 20;

interface QuestVideoPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Searchable checklist of published videos from the content library (`GET /admin/content`) — a
 * quest's curated set is content ids. Selected ids outside the current search stay selected.
 */
export function QuestVideoPicker({ value, onChange }: QuestVideoPickerProps) {
  // CustomSearch debounces; this is the settled query
  const [search, setSearch] = useState("");
  const q = search.trim();
  const { contentListQuery, contents } = useAdminContentList({
    status: ["published"],
    limit: PICKER_LIMIT,
    ...(q ? { q } : {}),
  });

  const toggle = (id: string) =>
    onChange(value?.includes(id) ? value?.filter((v) => v !== id) : [...(value ?? []), id]);

  return (
    <>
      <CustomSearch
        value={search}
        onSearch={setSearch}
        placeholder="Search published videos…"
        aria-label="Search videos"
        // the picker sits inside the quest form: Enter searches, it mustn't submit the form
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      />
      {/* fixed height: loading, empty and error states keep the box the same size */}
      <div className="border-border/40 h-44 space-y-1 overflow-y-auto rounded-lg border p-1">
        {contentListQuery.isPending ? (
          <Skeleton className="bg-muted/20 h-full w-full rounded-md" />
        ) : contentListQuery.isError ? (
          <p className="text-destructive flex h-full items-center justify-center p-2 text-center text-sm">
            Couldn&apos;t load videos: {contentListQuery.error?.message}
          </p>
        ) : contents?.length === 0 ? (
          <p className="text-muted-foreground flex h-full items-center justify-center p-2 text-center text-sm">
            {q ? "No videos found" : "No published videos yet."}
          </p>
        ) : (
          contents?.map((video) => {
            const selected = value?.includes(video?.id);
            return (
              <button
                key={video?.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => toggle(video?.id)}
                className={cn(
                  "hover:bg-muted/40 flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left",
                  selected && "bg-accent/10",
                )}>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border",
                    selected ? "bg-accent border-accent text-accent-foreground" : "border-border",
                  )}>
                  {selected && <Check className="h-3.5 w-3.5" />}
                </div>
                <Film className="text-muted-foreground h-4 w-4" />
                <span className="flex-1 text-sm">{video?.title}</span>
                <span className="text-muted-foreground text-xs">
                  {formatDuration(video?.durationSeconds)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
