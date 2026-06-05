"use client";

import { useMemo, useState } from "react";

import { Ban, Search, Unlock, UserX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { type Column, DataTable } from "@/components/custom/data-table";

import { StatsCard } from "../../moderation/_components/stats-card";

interface BlockedUser {
  id: string;
  name: string;
  email: string;
  reason: string;
  bannedDate: string;
  bannedBy: string;
}

const mockBlockedUsers: BlockedUser[] = [
  {
    id: "u1",
    name: "ToxicUser42",
    email: "toxic42@email.com",
    reason: "Repeated hate speech violations",
    bannedDate: "2025-01-15",
    bannedBy: "Admin Sarah",
  },
  {
    id: "u2",
    name: "SpammerBot",
    email: "spammer@email.com",
    reason: "Automated spam activity",
    bannedDate: "2025-01-10",
    bannedBy: "System Auto-ban",
  },
  {
    id: "u3",
    name: "HarasserAccount",
    email: "harasser@email.com",
    reason: "Targeted harassment of multiple users",
    bannedDate: "2025-01-08",
    bannedBy: "Admin Marcus",
  },
  {
    id: "u4",
    name: "FakeAccount123",
    email: "fake123@email.com",
    reason: "Fraudulent activity and impersonation",
    bannedDate: "2024-12-28",
    bannedBy: "Owner",
  },
];

export function SecurityAccessSettings() {
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [unblockUser, setUnblockUser] = useState<BlockedUser | null>(null);

  const filteredUsers = useMemo(() => {
    return blockedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [blockedUsers, searchQuery]);

  const handleUnblock = () => {
    if (unblockUser) {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== unblockUser.id));
      toast.success(`User "${unblockUser.name}" unblocked successfully`);
      setUnblockUser(null);
    }
  };

  const columns: Column<BlockedUser>[] = [
    {
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="bg-destructive/20 flex h-8 w-8 items-center justify-center rounded-full">
            <UserX className="text-destructive h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Reason",
      cell: (user) => (
        <p className="text-muted-foreground max-w-[200px] truncate text-sm">{user.reason}</p>
      ),
    },
    {
      header: "Banned Date",
      accessorKey: "bannedDate",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "Banned By",
      accessorKey: "bannedBy",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "Action",
      className: "w-[100px]",
      cell: (user) => (
        <Button
          variant="outline"
          size="sm"
          className="text-warning hover:text-warning gap-1"
          onClick={() => setUnblockUser(user)}>
          <Unlock className="h-3 w-3" />
          Unblock
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Blocked Users Section */}
      <div className="border-border/50 bg-card/50 space-y-4 rounded-lg border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/20 flex h-10 w-10 items-center justify-center rounded-lg">
              <Ban className="text-destructive h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-semibold">Blocked Users</h3>
              <p className="text-muted-foreground text-sm">
                {blockedUsers.length} permanently banned accounts
              </p>
            </div>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background/50 pl-9"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          rowIdKey="id"
          emptyState={
            <div className="py-8 text-center">
              <Ban className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground text-sm">No blocked users found</p>
            </div>
          }
          className="bg-card/50 border-border/50 rounded-lg border"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard
          label="Total Blocked"
          value={blockedUsers.length}
          icon={Ban}
          subtitle={
            <Badge
              variant="outline"
              className="bg-destructive/20 border-destructive/30 text-destructive">
              Permanent
            </Badge>
          }
        />
        <StatsCard
          label="This Month"
          value="12"
          icon={UserX}
          subtitle={
            <Badge variant="outline" className="bg-warning/20 border-warning/30 text-warning">
              +3 from last
            </Badge>
          }
        />
        <StatsCard
          label="Auto-banned"
          value="45%"
          icon={Unlock}
          subtitle={
            <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary">
              AI Detection
            </Badge>
          }
        />
      </div>

      <ConfirmationDialog
        open={!!unblockUser}
        onOpenChange={() => setUnblockUser(null)}
        title="Unblock User?"
        description={
          <>
            Are you sure you want to unblock <strong>{unblockUser?.name}</strong>? They will regain
            full access to the platform immediately.
            <div className="bg-warning/10 border-warning/30 my-3 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">
                <strong>Original ban reason:</strong> {unblockUser?.reason}
              </p>
            </div>
          </>
        }
        onConfirm={handleUnblock}
        action="custom"
        confirmLabel="Unblock User"
      />
    </div>
  );
}
