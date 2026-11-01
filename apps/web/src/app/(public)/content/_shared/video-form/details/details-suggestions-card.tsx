"use client";

import { Sparkles } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TaxonomySort, useGenres, useTags } from "@/app/_libs/hooks/api/use-content-taxonomy";
import { CONTENT_LIMITS, type ContentCreateFormValues } from "@/app/_libs/schemas";

import { SUGGESTIONS_LIMIT } from "../../../_libs/video-form/details/details-options";

const mostUsed = <T extends { contentCount: number }>(rows: T[]) =>
  [...rows].sort((a, b) => b.contentCount - a.contentCount).slice(0, SUGGESTIONS_LIMIT);

/** One-click picks of the library's most-used genres and tags that aren't selected yet. */
export function DetailsSuggestionsCard() {
  const { control, setValue } = useFormContext<ContentCreateFormValues>();
  const genreIds = useWatch({ control, name: "genreIds" });
  const tagIds = useWatch({ control, name: "tagIds" });
  const { genres } = useGenres();
  // Enough most-used tags that some remain once the selected ones are left out.
  const { tags: libraryTags } = useTags({
    sort: TaxonomySort.MostUsed,
    limit: SUGGESTIONS_LIMIT + CONTENT_LIMITS.tagsMax,
  });

  const genreSuggestions =
    genreIds?.length < CONTENT_LIMITS.genresMax
      ? mostUsed(genres.filter((g) => g.isActive && !genreIds.includes(g.id)))
      : [];
  const tagSuggestions =
    tagIds?.length < CONTENT_LIMITS.tagsMax
      ? mostUsed(libraryTags.filter((t) => !tagIds.includes(t.id)))
      : [];

  if (!genreSuggestions?.length && !tagSuggestions?.length) return null;

  const options = { shouldDirty: true, shouldValidate: true };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="text-accent h-4 w-4" /> Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {genreSuggestions?.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs">Popular genres</p>
            <div className="flex flex-wrap gap-2">
              {genreSuggestions?.map((g) => (
                <SuggestionChip
                  key={g.id}
                  onClick={() => setValue("genreIds", [...genreIds, g.id], options)}>
                  + {g?.name}
                </SuggestionChip>
              ))}
            </div>
          </div>
        )}
        {tagSuggestions?.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs">Popular tags</p>
            <div className="flex flex-wrap gap-2">
              {tagSuggestions?.map((t) => (
                <SuggestionChip
                  key={t.id}
                  onClick={() => setValue("tagIds", [...tagIds, t.id], options)}>
                  + {t?.name}
                </SuggestionChip>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SuggestionChip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border/50 hover:border-primary hover:text-primary cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors">
      {children}
    </button>
  );
}
