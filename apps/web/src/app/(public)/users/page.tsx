"use client";

import { useState } from "react";

import { useSearchParams } from "next/navigation";

import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import { PushNotificationModal } from "./_components/push-notification-modal";
import { UserAnalytics } from "./_components/user-analytics";
import { UserDetailModal } from "./_components/user-detail-modal";
import { type User, UserListTable } from "./_components/user-list-table";
import { UserRegionalAnalytics } from "./_components/user-regional-analytics";

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

      <UserAnalytics />

      <div className="space-y-4">
        <h2 className="text-foreground text-lg font-semibold">Per-Region User Data</h2>
        <UserRegionalAnalytics />
      </div>

      <div className="space-y-4">
        <h2 className="text-foreground text-lg font-semibold">User Directory</h2>
        <UserListTable onViewUser={handleViewUser} onSendNotification={handleSendNotification} />
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
