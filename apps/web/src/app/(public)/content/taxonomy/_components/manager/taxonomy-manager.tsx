"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { TaxonomySummaryDto } from "@/app/_libs/api/generated";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { CustomSearch } from "@/components/custom/custom-search";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { DataTable } from "@/components/custom/data-table";
import { GlassCard } from "@/components/custom/glass-card";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import {
  TAXONOMY_COPY,
  TAXONOMY_SEARCH_DEBOUNCE_MS,
  TAXONOMY_SORT_OPTIONS,
  TAXONOMY_TABLE_CLASS_NAMES,
  TAXONOMY_TABLE_HEIGHT,
  type TaxonomyTabConfig,
} from "../../_shared/taxonomy-config";
import {
  type TaxonomyFormValues,
  type TaxonomyImageGetter,
  type TaxonomyMetaGetter,
  type TaxonomyMutationCallbacks,
  type TaxonomyRow,
} from "../../_shared/taxonomy-types";
import type { TaxonomyListState } from "../../_shared/use-taxonomy-list-state";
import { buildTaxonomyColumns } from "./taxonomy-columns";
import { TaxonomyItemModal } from "./taxonomy-item-modal";
import { TaxonomySummary } from "./taxonomy-summary";

interface TaxonomyManagerProps<T extends TaxonomyRow> extends TaxonomyTabConfig {
  /** SDK rows, rendered as-is. */
  items: T[];
  /** Search / sort — the tab passes the same state to its list hook. */
  listState: TaxonomyListState;
  /** Footer stats over every row the search matched (all pages). */
  summary?: TaxonomySummaryDto;
  /** Infinite-scroll lists (tags, people) only: loads the next page near the table's end. */
  infiniteScroll?: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
  };
  /** Extra filters beside search + sort (e.g. the people role filter). */
  filters?: React.ReactNode;
  /** One of `filters` is set — an empty table then reads "No matches". */
  isFiltered?: boolean;
  /** Persists an add (`editing` null) or edit, reporting back through `callbacks`. */
  onSave: (
    values: TaxonomyFormValues,
    editing: T | null,
    callbacks: TaxonomyMutationCallbacks,
  ) => void;
  onDelete: (row: T, callbacks: TaxonomyMutationCallbacks) => void;
  /** The row's meta value (studio country code, person role); omit for genres and tags. */
  getMeta?: TaxonomyMetaGetter<T>;
  /** The row's logo / photo URL; omit for tabs without an image. */
  getImageUrl?: TaxonomyImageGetter<T>;
  /** Shows the Status column + enable/disable action; omit for tabs without a status. */
  isActive?: (row: T) => boolean;
  /** Persists the new active state, reporting back through `callbacks`. */
  onToggleActive?: (row: T, active: boolean, callbacks: TaxonomyMutationCallbacks) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  metaOptions?: CustomSelectOption[];
  showCount?: boolean;
}

export function TaxonomyManager<T extends TaxonomyRow>({
  title,
  noun,
  metaLabel,
  imageLabel,
  items,
  listState,
  summary,
  infiniteScroll,
  filters,
  isFiltered = false,
  onSave,
  onDelete,
  getMeta,
  getImageUrl,
  isActive,
  onToggleActive,
  isLoading,
  isError,
  onRetry,
  isRetrying,
  metaOptions,
  showCount = true,
}: TaxonomyManagerProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  /** Bumped per open so the modal remounts with fresh fields. */
  const [modalKey, setModalKey] = useState(0);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const loaderRef = useInfiniteScroll({ ...infiniteScroll, enabled: !!infiniteScroll });

  const openModal = (row: T | null) => {
    setEditing(row);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const save = (values: TaxonomyFormValues) => {
    setIsSaving(true);
    onSave(values, editing, {
      onSuccess: (response) => {
        setIsSaving(false);
        toast.success(
          response?.message ||
            (editing ? TAXONOMY_COPY.updated(noun) : TAXONOMY_COPY.created(noun)),
        );
        setModalOpen(false);
      },
      onError: (error) => {
        setIsSaving(false);
        toast.error(error?.message || TAXONOMY_COPY.saveError(noun));
      },
    });
  };

  // The API refuses (409) to delete anything a video still uses, so an in-use row only explains.
  const deletingInUse = (deleting?.contentCount ?? 0) > 0;

  const confirmDelete = () => {
    if (!deleting) return;
    const row = deleting;
    setDeleting(null);
    if (deletingInUse) return;
    onDelete(row, {
      onSuccess: (response) =>
        toast.success(response?.message || TAXONOMY_COPY.deleted(noun, row?.name)),
      onError: (error) => toast.error(error?.message || TAXONOMY_COPY.deleteError(noun)),
    });
  };

  const toggleActive = (row: T) => {
    if (!isActive || !onToggleActive) return;
    const next = !isActive(row);
    setTogglingId(row?.id);
    onToggleActive(row, next, {
      onSuccess: (response) => {
        setTogglingId(null);
        toast.success(
          response?.message ||
            (next
              ? TAXONOMY_COPY.enabled(noun, row?.name)
              : TAXONOMY_COPY.disabled(noun, row?.name)),
        );
      },
      onError: (error) => {
        setTogglingId(null);
        toast.error(error?.message || TAXONOMY_COPY.toggleError(noun));
      },
    });
  };

  const columns = buildTaxonomyColumns({
    imageLabel,
    getImageUrl,
    metaLabel,
    getMeta,
    metaOptions,
    showCount,
    isActive,
    onToggleActive: onToggleActive ? toggleActive : undefined,
    togglingId,
    onEdit: openModal,
    onDelete: setDeleting,
  });

  return (
    <GlassCard className="p-0">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h3 className="text-foreground text-base font-semibold">{title}</h3>
        <CustomButton
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => openModal(null)}>
          Add {noun}
        </CustomButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
        <CustomSearch
          value={listState.q}
          onSearch={listState.onSearch}
          debounceMs={TAXONOMY_SEARCH_DEBOUNCE_MS}
          placeholder={TAXONOMY_COPY.searchPlaceholder(title)}
          containerClassName="min-w-0 flex-1 sm:max-w-xs sm:flex-none sm:w-xs"
          inputClassName="text-base md:text-sm"
        />
        <CustomSelect
          options={TAXONOMY_SORT_OPTIONS}
          value={listState.sort}
          onValueChange={listState.onSortChange}
          triggerClassName="w-fit shrink-0"
          aria-label="Sort"
        />
        {filters}
      </div>

      {isError ? (
        <CustomRetryState
          title={TAXONOMY_COPY.loadError(title)}
          onRetry={() => onRetry?.()}
          isRetrying={isRetrying}
          className="border-border/40 border-t"
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          rowIdKey="id"
          className={`border-border/40 border-t bg-transparent ${TAXONOMY_TABLE_HEIGHT}`}
          classNames={TAXONOMY_TABLE_CLASS_NAMES}
          infiniteScrollRef={infiniteScroll ? loaderRef : undefined}
          isFetchingNextPage={infiniteScroll?.isFetchingNextPage}
          emptyState={
            isLoading
              ? TAXONOMY_COPY.loading(title)
              : listState.q || isFiltered
                ? TAXONOMY_COPY.noMatches
                : TAXONOMY_COPY.empty(title)
          }
        />
      )}

      <TaxonomySummary summary={summary} />

      <TaxonomyItemModal
        key={modalKey}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={
          editing
            ? {
                name: editing?.name,
                meta: getMeta?.(editing) ?? "",
                image: getImageUrl?.(editing) ?? undefined,
              }
            : null
        }
        noun={noun}
        metaLabel={metaLabel}
        metaOptions={metaOptions}
        imageLabel={imageLabel}
        isSaving={isSaving}
        onSubmit={save}
      />

      <ConfirmationDialog
        open={!!deleting}
        onOpenChange={() => setDeleting(null)}
        title={deletingInUse ? TAXONOMY_COPY.deleteInUseTitle(noun) : `Delete ${noun}`}
        description={
          deletingInUse
            ? TAXONOMY_COPY.deleteInUse(deleting?.name ?? "", deleting?.contentCount ?? 0)
            : `Delete "${deleting?.name}"?`
        }
        onConfirm={confirmDelete}
        action={deletingInUse ? "custom" : "delete"}
        confirmLabel={deletingInUse ? "Got it" : undefined}
        destructive={!deletingInUse}
      />
    </GlassCard>
  );
}
