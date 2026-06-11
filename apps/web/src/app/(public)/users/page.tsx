"use client";

import { useSearchParams } from "next/navigation";

import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import { UserAnalytics } from "./_components/user-analytics";
import { UserDirectory } from "./_components/user-directory";
import { UserRegionalAnalytics } from "./_components/user-regional-analytics";

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? "7d";
  const searchQuery = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">User Management</h1>
          <p className="text-foreground-secondary mt-1">CRM & 360° user profiles with analytics.</p>
        </div>
        <TimeRangeSelector defaultValue={timeRange} />
      </div>

      <UserAnalytics />

      <div className="space-y-4">
        <h2 className="text-foreground text-lg font-semibold">Per-Region User Data</h2>
        <UserRegionalAnalytics />
      </div>

      <UserDirectory
        searchQuery={searchQuery}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
