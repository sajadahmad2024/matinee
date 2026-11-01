"use client";

import {
  Clock,
  Mail,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AdminStatusEnum,
  type AdminUserResponseDto,
  SystemRoleName,
} from "@/app/_libs/hooks/api/use-admin-admins";
import {
  formatRoleName,
  getUserDisplayName,
  getUserEmail,
  getUserInitials,
} from "@/app/_libs/utils/user-display";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomSearch } from "@/components/custom/custom-search";
import { type Column, DataTable } from "@/components/custom/data-table";
import { StatusBadge } from "@/components/custom/status-badge";

interface AdminTeamTableProps {
  admins: AdminUserResponseDto[];
  infiniteScrollRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  /** Current (debounced) search — for the empty-state text. */
  search: string;
  /** Debounced by `CustomSearch`. */
  onSearch: (search: string) => void;
  isLoading: boolean;
  currentAdminId: string | undefined;
  isViewerSuperAdmin: boolean;
  canWrite: boolean;
  canDelete: boolean;
  onInvite: () => void;
  onResendInvite: (admin: AdminUserResponseDto) => void;
  onDisable: (admin: AdminUserResponseDto) => void;
  onEnable: (admin: AdminUserResponseDto) => void;
  onViewActivity: (admin: AdminUserResponseDto) => void;
}

const getRoleBadge = (role: string) =>
  role === SystemRoleName.SuperAdmin ? (
    <Badge
      key={role}
      variant="outline"
      className="bg-primary/20 border-primary/30 text-primary gap-1">
      <ShieldCheck className="h-3 w-3" />
      {formatRoleName(role)}
    </Badge>
  ) : (
    <Badge key={role} variant="outline" className="bg-accent/20 border-accent/30 text-accent gap-1">
      <Shield className="h-3 w-3" />
      {formatRoleName(role)}
    </Badge>
  );

/** Display-only status (not a backend value): an active admin who hasn't accepted the invite. */
const INVITED_STATUS = "invited";

const TABLE_HEIGHT = "min-h-[320px] max-h-[560px]";

const formatJoined = (createdAt: string) => {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

export function AdminTeamTable({
  admins,
  infiniteScrollRef,
  isFetchingNextPage,
  search,
  onSearch,
  isLoading,
  currentAdminId,
  isViewerSuperAdmin,
  canWrite,
  canDelete,
  onInvite,
  onResendInvite,
  onDisable,
  onEnable,
  onViewActivity,
}: AdminTeamTableProps) {
  const columns: Column<AdminUserResponseDto>[] = [
    {
      header: "Admin",
      cell: (admin) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {getUserInitials(admin)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground text-sm font-medium">
              {getUserDisplayName(admin)}
              {admin?.id === currentAdminId && (
                <span className="text-muted-foreground ml-1.5 text-xs">(you)</span>
              )}
            </p>
            <p className="text-muted-foreground text-xs">{getUserEmail(admin)}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (admin) => (
        <div className="flex flex-wrap gap-1">
          {admin?.roles?.length ? (
            admin?.roles?.map(getRoleBadge)
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (admin) => (
        <StatusBadge
          status={
            admin?.status === AdminStatusEnum.Active && admin?.invitePending
              ? INVITED_STATUS
              : admin?.status
          }
        />
      ),
    },
    {
      header: "Joined",
      cell: (admin) => (
        <span className="text-muted-foreground text-sm">{formatJoined(admin?.createdAt)}</span>
      ),
    },
    {
      header: "",
      className: "w-[50px]",
      cell: (admin) => {
        const isSelf = admin?.id === currentAdminId;
        const isTargetSuperAdmin = admin?.roles?.includes(SystemRoleName.SuperAdmin) ?? false;
        const canManageRow = !isSelf && (isViewerSuperAdmin || !isTargetSuperAdmin);
        const canManage = canWrite && canManageRow;
        // A super admin can never be removed, by anyone.
        const canRevoke = canDelete && canManageRow && !isTargetSuperAdmin;
        const isActive = admin?.status === AdminStatusEnum.Active;
        const canResendInvite = canWrite && !isSelf && isActive && admin?.invitePending;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                aria-label="Admin actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-border bg-card w-48 **:[[role=menuitem]]:cursor-pointer">
              {canResendInvite && (
                <DropdownMenuItem onClick={() => onResendInvite(admin)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Invite Code
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onViewActivity(admin)}>
                <Clock className="mr-2 h-4 w-4" />
                Activity History
              </DropdownMenuItem>
              {canRevoke && isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => onDisable(admin)}>
                    <UserX className="mr-2 h-4 w-4" />
                    Revoke Access
                  </DropdownMenuItem>
                </>
              )}
              {canManage && admin?.status === AdminStatusEnum.Disabled && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-success focus:bg-success/10 focus:text-success"
                    onClick={() => onEnable(admin)}>
                    <UserCheck className="text-success mr-2 h-4 w-4" />
                    Restore Access
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <CustomSearch
          placeholder="Search admins..."
          onSearch={onSearch}
          containerClassName="max-w-sm flex-1"
        />
        {canWrite && (
          <CustomButton leftIcon={<UserPlus className="h-4 w-4" />} onClick={onInvite}>
            Invite Admin
          </CustomButton>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border">
        {isLoading ? (
          <div className={`space-y-3 p-4 ${TABLE_HEIGHT}`}>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="bg-secondary h-10 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            className={`${TABLE_HEIGHT}`}
            columns={columns}
            data={admins}
            rowIdKey="id"
            infiniteScrollRef={infiniteScrollRef}
            isFetchingNextPage={isFetchingNextPage}
            emptyState={
              <p className="text-muted-foreground py-8 text-center text-sm">
                {search ? "No admins match your search." : "No admins yet."}
              </p>
            }
          />
        )}
      </div>
    </div>
  );
}
