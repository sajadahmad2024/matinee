"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useAdCampaigns, useRefreshAds, useSwapAdRanks } from "@/app/_libs/hooks/api/use-admin-ads";
import { regionLabel } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomSearch } from "@/components/custom/custom-search";
import { CustomSelect } from "@/components/custom/custom-select";
import { CustomTabs } from "@/components/custom/custom-tabs";
import { DataTable, LISTING_TABLE_CLASS_NAMES } from "@/components/custom/data-table";
import { ResetFiltersButton } from "@/components/custom/reset-filters-button";
import { useListUrlState } from "@/hooks/use-list-url-state";

import {
  AD_LIST_FILTERS,
  AD_LIST_PAGE_SIZE,
  AD_LIST_TABS,
  AD_REGION_ALL,
  AD_REGION_OPTIONS,
  AD_ROUTES,
  AD_TAB_ALL,
  type AdListRegion,
  rankIn,
} from "../_libs/ad-config";
import { type AdCampaignDto, AdCampaignTypeEnum } from "../_libs/ad-types";
import { getAdColumns } from "./ad-columns";
import { AdRowActions } from "./ad-row-actions";
import { AdStatusConfirmDialog, useAdStatusActions } from "./ad-status-actions";
import { AdSwapBar } from "./ad-swap-bar";

/**
 * Ad list: status tabs, search and region in the URL; row actions. All regions by default; one
 * region lists its ads in feed order and lets two of them swap ranks.
 */
export function AdList() {
  const router = useRouter();
  const {
    page,
    limit,
    q,
    filters,
    pageSizeOptions,
    isFiltered,
    setPage,
    setLimit,
    setQ,
    setFilter,
    reset,
    listReturnTo,
  } = useListUrlState({
    filters: AD_LIST_FILTERS,
    defaultPageSize: AD_LIST_PAGE_SIZE,
  });
  const { refresh, isRefreshing } = useRefreshAds();
  const { region, status } = filters;
  const selectedRegion = region === AD_REGION_ALL ? null : region;

  const { campaignsQuery, campaigns, total, totalPages } = useAdCampaigns({
    type: AdCampaignTypeEnum.Commercial,
    region: selectedRegion ?? undefined,
    status: status === AD_TAB_ALL ? undefined : [status],
    q: q || undefined,
    page,
    limit,
  });

  const { request, dialog, pendingId } = useAdStatusActions();
  const { swapAdRanksMutation } = useSwapAdRanks();

  // swap: pick two ranked ads in the current region, then confirm; picks belong to one region
  const [picks, setPicks] = useState<{ region: AdListRegion; ads: AdCampaignDto[] }>({
    region,
    ads: [],
  });
  const picked = selectedRegion && picks.region === region ? picks.ads : [];
  const [confirmSwap, setConfirmSwap] = useState(false);
  const label = selectedRegion ? regionLabel(selectedRegion) : "";

  // the newest pick replaces the oldest once two are chosen
  const togglePick = (ad: AdCampaignDto) =>
    setPicks({
      region,
      ads: picked?.some((p) => p?.id === ad?.id)
        ? picked?.filter((p) => p?.id !== ad?.id)
        : [...picked, ad].slice(-2),
    });
  const clearPicks = () => setPicks({ region, ads: [] });

  const swap = () => {
    setConfirmSwap(false);
    if (!selectedRegion) return;
    swapAdRanksMutation.mutate(
      { region: selectedRegion, campaignIds: picked?.map((p) => p?.id) },
      {
        onSuccess: () => {
          toast.success(`Swapped ranks in ${label}`);
          clearPicks();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const columns = getAdColumns({
    region: selectedRegion,
    pickedIds: picked?.map((p) => p?.id),
    onTogglePick: togglePick,
    renderActions: (ad) => (
      <AdRowActions
        campaign={ad}
        onAction={request}
        isPending={pendingId === ad?.id}
        returnTo={listReturnTo}
      />
    ),
    returnTo: listReturnTo,
  });

  const [first, second] = picked;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <CustomSearch
          value={q}
          onSearch={setQ}
          placeholder="Search ads or advertisers"
          containerClassName="sm:w-72"
        />
        <CustomSelect
          options={AD_REGION_OPTIONS}
          value={region}
          onValueChange={(next) => setFilter("region", next)}
          triggerClassName="w-fit"
          aria-label="Region"
        />
        <CustomTabs
          items={AD_LIST_TABS}
          value={status}
          onValueChange={(next) => setFilter("status", next)}
          aria-label="Status"
        />
        <div className="flex items-center gap-2">
          {/* Picks up other admins' changes without a page reload */}
          <CustomButton
            variant="outline"
            size="icon"
            onClick={() => refresh()}
            disabled={isRefreshing}
            aria-label="Refresh ads"
            title="Refresh">
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </CustomButton>
          {isFiltered && <ResetFiltersButton onReset={reset} />}
        </div>
      </div>

      {selectedRegion && (
        <AdSwapBar
          picked={picked}
          region={selectedRegion}
          regionLabel={label}
          onClear={clearPicks}
          onSwap={() => setConfirmSwap(true)}
          isPending={swapAdRanksMutation.isPending}
        />
      )}

      <DataTable
        columns={columns}
        data={campaigns}
        rowIdKey="id"
        onRowClick={(ad) => router.push(AD_ROUTES.details(ad?.id, listReturnTo))}
        className="border-border/40 rounded-lg border"
        classNames={{
          ...LISTING_TABLE_CLASS_NAMES,
          // a floor for short pages, so the pagination stays put
          // previous page stays visible while the next one loads (keepPreviousData) — dim it
          container: cn(
            "bg-transparent min-h-100 transition-opacity",
            campaignsQuery.isPlaceholderData && "opacity-60",
          ),
          row: "hover:bg-muted/30 group border-border",
        }}
        isLoading={campaignsQuery.isPending}
        isError={campaignsQuery.isError}
        onRetry={() => void campaignsQuery.refetch()}
        isRetrying={campaignsQuery.isFetching}
        emptyState={<span className="text-muted-foreground">No ads here.</span>}
        pagination={{
          currentPage: page,
          totalPages,
          pageSize: limit,
          totalItems: total,
          onPageChange: setPage,
          onPageSizeChange: setLimit,
          pageSizeOptions: [...pageSizeOptions],
        }}
      />

      <ConfirmationDialog
        open={confirmSwap}
        onOpenChange={setConfirmSwap}
        action="custom"
        title={`Swap ranks in ${label}?`}
        description={
          selectedRegion && first && second ? (
            <span className="block space-y-1">
              <span className="block">
                “{first?.name}”: #{rankIn(first, selectedRegion)} → #
                {rankIn(second, selectedRegion)}
              </span>
              <span className="block">
                “{second?.name}”: #{rankIn(second, selectedRegion)} → #
                {rankIn(first, selectedRegion)}
              </span>
              <span className="text-muted-foreground block pt-1">
                Takes effect in the feed straight away. Other regions are unchanged.
              </span>
            </span>
          ) : null
        }
        confirmLabel="Swap ranks"
        destructive={false}
        onConfirm={swap}
      />

      <AdStatusConfirmDialog {...dialog} />
    </div>
  );
}
