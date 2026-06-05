import { Suspense } from "react";
import { UserAnalytics } from "./_components/user-analytics";
import { UserDirectory } from "./_components/user-directory";
import { TimeRangeSelector } from "./_components/time-range-selector";

export type UserSearchParams = {
  timeRange?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  searchParams: Promise<UserSearchParams>;
}

export default async function UserManagementPage({ searchParams }: PageProps) {
  const {
    timeRange = "7d",
    q = "",
    page = "1",
    pageSize = "10",
  } = await searchParams;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">User Management</h1>
          <p className="text-foreground-secondary mt-1">CRM & 360° user profiles with analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="h-10 w-[140px] animate-pulse rounded-md bg-muted" />}>
            <TimeRangeSelector defaultValue={timeRange} />
          </Suspense>
        </div>
      </div>

      {/* Analytics Section */}
      <Suspense fallback={<div className="h-[200px] w-full animate-pulse rounded-xl bg-muted/20" />}>
        <UserAnalytics timeRange={timeRange} />
      </Suspense>

      {/* User Directory Section */}
      <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-xl bg-muted/10" />}>
        <UserDirectory
          searchQuery={q}
          page={Number(page)}
          pageSize={Number(pageSize)}
        />
      </Suspense>
    </div>
  );
}
