"use client";

import { useMemo, useState } from "react";

import {
  Clock,
  Edit,
  MoreHorizontal,
  Search,
  Shield,
  ShieldCheck,
  UserPlus,
  UserX,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { type Column, DataTable } from "@/components/custom/data-table";

import { type Admin } from "./types";

interface AdminTeamTableProps {
  admins: Admin[];
  onInvite: () => void;
  onViewActivity: (admin: Admin) => void;
  onRevoke: (adminId: string) => void;
}

const getRoleBadge = (role: Admin["role"]) => {
  if (role === "super_admin") {
    return (
      <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary gap-1">
        <ShieldCheck className="h-3 w-3" />
        Super Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-accent/20 border-accent/30 text-accent gap-1">
      <Shield className="h-3 w-3" />
      Admin
    </Badge>
  );
};

export function AdminTeamTable({
  admins,
  onInvite,
  onViewActivity,
  onRevoke,
}: AdminTeamTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [admins, searchQuery]);

  const columns: Column<Admin>[] = [
    {
      header: "Admin",
      cell: (admin) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={admin.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {admin.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground text-sm font-medium">{admin.name}</p>
            <p className="text-muted-foreground text-xs">{admin.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (admin) => getRoleBadge(admin.role),
    },
    {
      header: "Status",
      cell: (admin) => (
        <Badge
          variant="outline"
          className={
            admin.status === "active"
              ? "bg-success/20 border-success/30 text-success"
              : "bg-warning/20 border-warning/30 text-warning"
          }>
          {admin.status === "active" ? "Active" : "Invited"}
        </Badge>
      ),
    },
    {
      header: "Last Active",
      accessorKey: "lastActive",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "",
      className: "w-[50px]",
      cell: (admin) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-border bg-card w-48">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewActivity(admin)}>
              <Clock className="mr-2 h-4 w-4" />
              Activity History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onRevoke(admin.id)}>
              <UserX className="mr-2 h-4 w-4" />
              Revoke Access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background/50 pl-9"
          />
        </div>
        <Button className="gap-2" onClick={onInvite}>
          <UserPlus className="h-4 w-4" />
          Invite Admin
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredAdmins}
        rowIdKey="id"
        className="rounded-lg border"
      />
    </div>
  );
}
