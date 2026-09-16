"use client";

import { useState } from "react";

import { useSearchParams } from "next/navigation";

import { Activity, Megaphone, ShieldAlert, UserMinus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AdminHealthSummary, type HealthStat } from "@/components/custom/admin-health-summary";
import { CountryFilter } from "@/components/custom/country-filter";
import { FloatingRecommendedActions } from "@/components/custom/floating-recommended-actions";
import { type RecommendedAction } from "@/components/custom/recommended-actions";
import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import { PushNotificationModal } from "./_components/push-notification-modal";
import { UserAnalytics } from "./_components/user-analytics";
import { UserCommunicationsModal } from "./_components/user-communications";
import { UserDetailModal } from "./_components/user-detail-modal";
import { type User, UserListTable } from "./_components/user-list-table";
import { UserRegionalAnalytics } from "./_components/user-regional-analytics";
import { UserSegments } from "./_components/user-segments";

// Top-level User Health Summary — growth, retention, churn risk, active users at a glance.
const USER_HEALTH: HealthStat[] = [
  {
    label: "Total Users",
    value: "248.5K",
    insight: "+5.0% this period",
    trend: "up",
    tone: "good",
    icon: Users,
  },
  {
    label: "Active Users",
    value: "59.9%",
    insight: "DAU/MAU stickiness 35.7%",
    trend: "up",
    tone: "good",
    icon: Activity,
  },
  {
    label: "Churn Risk",
    value: "5.0%",
    insight: "APAC trending up",
    trend: "up",
    tone: "warning",
    icon: UserMinus,
  },
  {
    label: "Power / At-Risk",
    value: "312 / 1.2K",
    insight: "high-value users at risk",
    tone: "critical",
    icon: ShieldAlert,
  },
];

const USER_ACTIONS: RecommendedAction[] = [
  {
    title: "High-value users at risk",
    detail: "1.2K subscribers inactive 14+ days — trigger a win-back campaign",
    severity: "high",
    cta: "Review in directory",
    href: "/users#user-directory",
  },
  {
    title: "Regions with declining retention",
    detail: "APAC D30 retention down 4 pts vs last cohort",
    severity: "medium",
    cta: "Inspect regions",
    href: "/users#per-region",
  },
  {
    title: "Dormant reactivation",
    detail: "50.5K dormant users eligible for a re-engagement push",
    severity: "low",
    cta: "Open directory",
    href: "/users#user-directory",
  },
];

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? "7d";
  const country = searchParams.get("country") ?? "all";
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notificationUsers, setNotificationUsers] = useState<User[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleSendNotification = (users: User[]) => {
    setNotificationUsers(users);
    setIsNotificationOpen(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">User Management</h1>
          <p className="text-foreground-secondary mt-1">CRM & 360° user profiles with analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CountryFilter defaultValue={country} />
          <TimeRangeSelector defaultValue={timeRange} />
          {/* Occasional task — opens in a modal so it doesn't clutter the page */}
          <Button
            variant="outline"
            className="cursor-pointer gap-2"
            onClick={() => setIsCommsOpen(true)}>
            <Megaphone className="h-4 w-4" />
            Message Users
          </Button>
        </div>
      </div>

      {/* User Health Summary — the one-line read before anything else */}
      <AdminHealthSummary stats={USER_HEALTH} />

      {/* 1st — named-user segments: who to act on today */}
      <div id="segments" className="scroll-mt-24 space-y-4">
        <h2 className="text-foreground text-lg font-semibold">
          Top Spenders · Power Gamers · Churn Risk
        </h2>
        <UserSegments />
      </div>

      {/* 2nd — the whole per-region section */}
      <div id="per-region" className="scroll-mt-24 space-y-4">
        <h2 className="text-foreground text-lg font-semibold">Per-Region User Data</h2>
        <UserRegionalAnalytics />
      </div>

      <div id="user-directory" className="scroll-mt-24 space-y-4">
        <h2 className="text-foreground text-lg font-semibold">User Directory</h2>
        <UserListTable
          onViewUser={handleViewUser}
          onSendNotification={handleSendNotification}
          country={country}
        />
      </div>

      {/* Moved down — acquisition, engagement and retention cohorts are study charts */}
      <div id="cohorts" className="scroll-mt-24 space-y-4">
        <h2 className="text-foreground text-lg font-semibold">
          Acquisition · Engagement · Retention Cohorts
        </h2>
        <UserAnalytics />
      </div>

      <UserDetailModal user={selectedUser} open={isDetailOpen} onOpenChange={setIsDetailOpen} />

      <PushNotificationModal
        users={notificationUsers}
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
      />

      <UserCommunicationsModal open={isCommsOpen} onOpenChange={setIsCommsOpen} />

      {/* Recommended Actions — docked bottom-right, out of the page flow */}
      <FloatingRecommendedActions actions={USER_ACTIONS} />
    </div>
  );
}
