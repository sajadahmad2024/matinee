"use client";

import { useRouter } from "next/navigation";

import { useAdminProfile } from "@/app/_libs/hooks/api/use-admin-auth";
import {
  type AdminContentControllerListV1Request,
  useAdminContentList,
} from "@/app/_libs/hooks/api/use-admin-content";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { TablePagination } from "@/components/custom/table-pagination";
import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

import { CONTENT_PERMISSIONS, CONTENT_ROUTES } from "../../_shared/content-config";
import { type ContentRegionKey } from "../../_shared/content-types";
import {
  CONTENT_LIST_COPY,
  CONTENT_LIST_DEFAULTS,
  CONTENT_LIST_SKELETON_COUNT,
  CONTENT_PAGE_SIZE_OPTIONS,
  type ContentDateRange,
  type ContentSort,
  ContentTab,
  MASTER_NEWEST_SORT,
  TAB_STATUSES,
  createdFromForRange,
} from "./listing-config";
import { VideoListItem } from "./video-list-item";

interface VideoListProps {
  tab: ContentTab;
  searchQuery: string;
  sort: ContentSort;
  range: ContentDateRange;
  region: ContentRegionKey;
  page: number;
  pageSize: number;
}

/** URL filters → list request. */
const buildListParams = ({
  tab,
  searchQuery,
  sort,
  range,
  region,
  page,
  pageSize,
}: VideoListProps): AdminContentControllerListV1Request => ({
  status: TAB_STATUSES[tab],
  q: searchQuery.trim() || undefined,
  sort:
    tab === ContentTab.Master && sort === CONTENT_LIST_DEFAULTS.sort ? MASTER_NEWEST_SORT : sort,
  region: region === ALL_REGIONS ? undefined : region,
  createdFrom: createdFromForRange(range),
  page,
  limit: pageSize,
});

export function VideoList(props: VideoListProps) {
  const { tab, page, pageSize } = props;
  const router = useRouter();
  const updateSearchParams = useUpdateSearchParams();
  const { profile } = useAdminProfile();
  const canPublish = profile?.permissions?.includes(CONTENT_PERMISSIONS.Publish) ?? false;

  const { contentListQuery, contents, total, totalPages } = useAdminContentList(
    buildListParams(props),
  );

  // Every fetch (tab, page, search, sort) swaps the rows for the skeleton; the pagination stays,
  // showing the previous totals until the new page arrives.
  const renderRows = () => {
    if (contentListQuery?.isFetching) return <VideoListSkeleton />;
    if (contentListQuery?.isError) {
      return (
        <CustomRetryState
          title={CONTENT_LIST_COPY.errorTitle}
          description={contentListQuery?.error?.message || CONTENT_LIST_COPY.errorFallback}
          onRetry={() => contentListQuery?.refetch()}
          isRetrying={contentListQuery?.isRefetching}
          className="min-h-62.5"
        />
      );
    }
    if (total === 0) {
      return (
        <p className="text-muted-foreground py-16 text-center">{CONTENT_LIST_COPY.emptyTitle}</p>
      );
    }
    return (
      <div className="space-y-3">
        {contents?.map((content) => (
          <VideoListItem
            key={content.id}
            video={content}
            variant={tab === ContentTab.Master ? "master" : "default"}
            canPublish={canPublish}
            onView={(id) => router.push(CONTENT_ROUTES.details(id))}
            onEdit={(id) => router.push(CONTENT_ROUTES.edit(id))}
            onAnalytics={(id) => router.push(CONTENT_ROUTES.analytics(id))}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderRows()}

      {total > 0 && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          pageSizeOptions={CONTENT_PAGE_SIZE_OPTIONS}
          onPageChange={(p) => updateSearchParams({ page: String(p) }, { resetPage: false })}
          onPageSizeChange={(size) =>
            updateSearchParams({
              pageSize: size === CONTENT_LIST_DEFAULTS.pageSize ? null : String(size),
            })
          }
        />
      )}
    </div>
  );
}

function VideoListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: CONTENT_LIST_SKELETON_COUNT }, (_, i) => (
        <div key={i} className="bg-muted/80 h-28 w-full animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
