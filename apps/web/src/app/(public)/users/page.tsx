"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PushNotificationModal } from "./_components/push-notification-modal";
import { UserAnalytics } from "./_components/user-analytics";
import { UserDetailModal } from "./_components/user-detail-modal";
import { type User, UserListTable } from "./_components/user-list-table";

export default function UserManagementPage() {
  const [timeRange, setTimeRange] = useState("7d");
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
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card z-50">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="1m">Last month</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <UserAnalytics />

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
