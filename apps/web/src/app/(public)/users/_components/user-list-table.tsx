"use client";

import { useMemo, useState } from "react";

import {
  AlertTriangle,
  Bell,
  Calendar,
  Coins,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { type Column, DataTable } from "@/components/custom/data-table";
import { TablePagination } from "@/components/custom/table-pagination";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "suspended" | "banned";
  subscribed: boolean;
  subscriptionTier?: string;
  pointsBalance: number;
  reportsCount: number;
  lastActive: string;
  country: string;
}

interface UserListTableProps {
  onViewUser: (user: User) => void;
  onSendNotification: (users: User[]) => void;
}

const mockUsers: User[] = [
  {
    id: "USR_001",
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "",
    status: "active",
    subscribed: true,
    subscriptionTier: "Premium",
    pointsBalance: 12450,
    reportsCount: 0,
    lastActive: "2 mins ago",
    country: "USA",
  },
  {
    id: "USR_002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    avatar: "",
    status: "active",
    subscribed: true,
    subscriptionTier: "Basic",
    pointsBalance: 8900,
    reportsCount: 1,
    lastActive: "1 hour ago",
    country: "UK",
  },
  {
    id: "USR_003",
    name: "Mike Johnson",
    email: "mike.j@email.com",
    avatar: "",
    status: "suspended",
    subscribed: false,
    pointsBalance: 2340,
    reportsCount: 5,
    lastActive: "3 days ago",
    country: "Canada",
  },
  {
    id: "USR_004",
    name: "Sarah Wilson",
    email: "sarah.w@email.com",
    avatar: "",
    status: "active",
    subscribed: true,
    subscriptionTier: "Premium",
    pointsBalance: 45200,
    reportsCount: 0,
    lastActive: "5 mins ago",
    country: "Australia",
  },
  {
    id: "USR_005",
    name: "Alex Brown",
    email: "alex.b@email.com",
    avatar: "",
    status: "banned",
    subscribed: false,
    pointsBalance: 0,
    reportsCount: 12,
    lastActive: "30 days ago",
    country: "India",
  },
  {
    id: "USR_006",
    name: "Emily Chen",
    email: "emily.c@email.com",
    avatar: "",
    status: "active",
    subscribed: true,
    subscriptionTier: "Basic",
    pointsBalance: 6780,
    reportsCount: 0,
    lastActive: "15 mins ago",
    country: "Brazil",
  },
  {
    id: "USR_007",
    name: "David Kim",
    email: "david.k@email.com",
    avatar: "",
    status: "active",
    subscribed: false,
    pointsBalance: 1250,
    reportsCount: 2,
    lastActive: "2 hours ago",
    country: "Japan",
  },
  {
    id: "USR_008",
    name: "Lisa Martinez",
    email: "lisa.m@email.com",
    avatar: "",
    status: "active",
    subscribed: true,
    subscriptionTier: "Premium",
    pointsBalance: 32100,
    reportsCount: 0,
    lastActive: "Just now",
    country: "Mexico",
  },
];

export function UserListTable({ onViewUser, onSendNotification }: UserListTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "ban" | "delete";
  }>({ open: false, action: "ban" });

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesSubscription =
      subscriptionFilter === "all" ||
      (subscriptionFilter === "subscribed" && user.subscribed) ||
      (subscriptionFilter === "free" && !user.subscribed);

    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleBulkBan = () => {
    setConfirmDialog({ open: true, action: "ban" });
  };

  const confirmBulkAction = () => {
    toast.success(
      `${confirmDialog.action === "ban" ? "Banned" : "Deleted"} ${selectedUserIds.length} user(s)`,
    );
    setSelectedUserIds([]);
    setConfirmDialog({ open: false, action: "ban" });
  };

  const columns: Column<User>[] = [
    {
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-accent/10 text-accent text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (user) => {
        switch (user.status) {
          case "active":
            return (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                Active
              </Badge>
            );
          case "suspended":
            return (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                Suspended
              </Badge>
            );
          case "banned":
            return (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/30">
                Banned
              </Badge>
            );
        }
      },
    },
    {
      header: "Subscription",
      cell: (user) =>
        user.subscribed ? (
          <Badge className="bg-accent/10 text-accent border-accent/30">
            {user.subscriptionTier}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Free</span>
        ),
    },
    {
      header: "Points",
      headerClassName: "text-right",
      className: "text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Coins className="text-warning h-3 w-3" />
          <span className="text-foreground font-mono">{user.pointsBalance.toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: "Reports",
      headerClassName: "text-center",
      className: "text-center",
      cell: (user) =>
        user.reportsCount > 0 ? (
          <div className="flex items-center justify-center gap-1">
            <AlertTriangle
              className={`h-3 w-3 ${user.reportsCount > 3 ? "text-destructive" : "text-warning"}`}
            />
            <span
              className={`font-mono ${user.reportsCount > 3 ? "text-destructive" : "text-warning"}`}>
              {user.reportsCount}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
    {
      header: "Last Active",
      cell: (user) => (
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {user.lastActive}
        </div>
      ),
    },
    {
      header: "",
      className: "w-[100px]",
      cell: (user) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewUser(user)}>
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-card z-50">
              <DropdownMenuItem onClick={() => onViewUser(user)}>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Suspend User</DropdownMenuItem>
              <DropdownMenuItem>Reset Password</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Ban User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, email, or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
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

      {/* Bulk Actions (Top) */}
      {selectedUserIds.length > 0 && (
        <div className="bg-accent/10 border-accent/20 flex items-center gap-4 rounded-lg border p-3">
          <span className="text-foreground text-sm">{selectedUserIds.length} user(s) selected</span>
          <Button
            size="sm"
            onClick={() =>
              onSendNotification(mockUsers.filter((u) => selectedUserIds.includes(u.id)))
            }
            className="gap-2">
            <Bell className="h-4 w-4" />
            Send Push Notification
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* User Table */}
      <div className="bg-card/50 border-border/50 rounded-lg border">
        <DataTable
          columns={columns}
          data={paginatedUsers}
          rowIdKey="id"
          selectable
          selectedIds={selectedUserIds}
          onSelectionChange={setSelectedUserIds}
        />

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Bulk Actions (Bottom) */}
      {selectedUserIds.length > 0 && (
        <div className="bg-accent/10 border-accent/20 flex items-center gap-4 rounded-lg border p-3">
          <span className="text-foreground text-sm">{selectedUserIds.length} user(s) selected</span>
          <Button
            size="sm"
            onClick={() =>
              onSendNotification(mockUsers.filter((u) => selectedUserIds.includes(u.id)))
            }
            className="gap-2">
            <Bell className="h-4 w-4" />
            Send Push Notification
          </Button>
          <Button size="sm" variant="destructive" onClick={handleBulkBan} className="gap-2">
            Ban Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds([])}>
            Clear Selection
          </Button>
        </div>
      )}

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={`Ban ${selectedUserIds.length} user${selectedUserIds.length > 1 ? "s" : ""}?`}
        description={`Are you sure you want to ban ${selectedUserIds.length} user${selectedUserIds.length > 1 ? "s" : ""}? This action cannot be undone.`}
        action="ban"
        onConfirm={confirmBulkAction}
      />
    </div>
  );
}
