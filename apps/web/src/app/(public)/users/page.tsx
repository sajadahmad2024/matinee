"use client";

import { useState } from "react";

import { useSearchParams } from "next/navigation";

import { Activity, MapPin, ShieldAlert, UserMinus, Users } from "lucide-react";

import { AdminHealthSummary, type HealthStat } from "@/components/custom/admin-health-summary";
import {
  RecommendedActions,
  type RecommendedAction,
} from "@/components/custom/recommended-actions";
import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import { PushNotificationModal } from "./_components/push-notification-modal";
import { UserAnalytics } from "./_components/user-analytics";
import { UserDetailModal } from "./_components/user-detail-modal";
import { type User, UserListTable } from "./_components/user-list-table";
import { UserRegionalAnalytics } from "./_components/user-regional-analytics";

// Top-level User Health Summary — growth, retention, churn risk, active users at a glance.
const USER_HEALTH: HealthStat[] = [
  { label: "Total Users", value: "248.5K", insight: "+5.0% this period", trend: "up", tone: "good", icon: Users },
  { label: "Active Users", value: "59.9%", insight: "DAU/MAU stickiness 35.7%", trend: "up", tone: "good", icon: Activity },
  { label: "Churn Risk", value: "5.0%", insight: "APAC trending up", trend: "up", tone: "warning", icon: UserMinus },
  { label: "Power / At-Risk", value: "312 / 1.2K", insight: "high-value users at risk", tone: "critical", icon: ShieldAlert },
];

const USER_ACTIONS: RecommendedAction[] = [
  { title: "High-value users at risk", detail: "1.2K subscribers inactive 14+ days — trigger a win-back campaign", severity: "high", cta: "Review", icon: ShieldAlert },
  { title: "Regions with declining retention", detail: "APAC D30 retention down 4 pts vs last cohort", severity: "medium", cta: "Inspect", icon: MapPin },
  { title: "Dormant reactivation", detail: "50.5K dormant users eligible for a re-engagement push", severity: "low", cta: "Notify", icon: UserMinus },
];

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? "7d";
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notificationUsers, setNotificationUsers] = useState<User[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
        <TimeRangeSelector defaultValue={timeRange} />
      </div>

      {/* User Health Summary — before diving into cohort/segmentation analytics */}
      <AdminHealthSummary stats={USER_HEALTH} />

      {/* Insight → action */}
      <RecommendedActions actions={USER_ACTIONS} />

      {/* User Directory — promoted above deep analytics (more frequent task) */}
      <div className="space-y-4">
        <h2 className="text-foreground text-lg font-semibold">User Directory</h2>
        <UserListTable onViewUser={handleViewUser} onSendNotification={handleSendNotification} />
      </div>

      {/* Deeper analytics — cohorts & regional breakdown lower on the page */}
      <UserAnalytics />

      <div className="space-y-4">
        <h2 className="text-foreground text-lg font-semibold">Per-Region User Data</h2>
        <UserRegionalAnalytics />
      </div>

      <UserDetailModal user={selectedUser} open={isDetailOpen} onOpenChange={setIsDetailOpen} />

      <PushNotificationModal
        users={notificationUsers}
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
      />
    </div>
  );
}
