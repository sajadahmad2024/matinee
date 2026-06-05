"use client";

import { useCallback, useEffect, useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Bell, Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PushNotificationModal } from "./push-notification-modal";
import { UserDetailModal } from "./user-detail-modal";
import { type User, UserListTable } from "./user-list-table";

interface UserDirectoryProps {
  searchQuery: string;
  page: number;
  pageSize: number;
}

export function UserDirectory({ searchQuery, page, pageSize }: UserDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- Modal States ---
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notificationUsers, setNotificationUsers] = useState<User[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // --- Search State ---
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const statusFilter = searchParams.get("status") || "all";
  const subscriptionFilter = searchParams.get("subscription") || "all";

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateQuery("q", localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery]);

  const updateQuery = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // Reset to first page on filter change
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleSendNotification = (users: User[]) => {
    setNotificationUsers(users);
    setIsNotificationOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-semibold">User Directory</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleSendNotification([])}>
            <Bell className="h-4 w-4" />
            Broadcast Notification
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, email, or User ID..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => updateQuery("status", v)}>
            <SelectTrigger className="min-w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card z-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subscriptionFilter} onValueChange={(v) => updateQuery("subscription", v)}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card z-50">
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="subscribed">Subscribed</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <UserListTable
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        subscriptionFilter={subscriptionFilter}
        page={page}
        pageSize={pageSize}
        onViewUser={handleViewUser}
        onSendNotification={handleSendNotification}
      />

      <UserDetailModal user={selectedUser} open={isDetailOpen} onOpenChange={setIsDetailOpen} />

      <PushNotificationModal
        users={notificationUsers}
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
      />
    </div>
  );
}
