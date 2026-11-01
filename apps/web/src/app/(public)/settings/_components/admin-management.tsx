"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  type AdminUserResponseDto,
  SystemRoleName,
  UpdateAdminDtoStatusEnum,
  useAdminAdminsList,
  useRemoveAdmin,
  useResendAdminInvite,
  useUpdateAdmin,
} from "@/app/_libs/hooks/api/use-admin-admins";
import { useAdminProfile } from "@/app/_libs/hooks/api/use-admin-auth";
import { getUserDisplayName, getUserEmail } from "@/app/_libs/utils/user-display";
import { CustomConfirmationModal } from "@/components/custom/custom-confirmation-modal";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { ActivityHistoryModal } from "./admin-management/activity-history-modal";
import { AdminStats } from "./admin-management/admin-stats";
import { AdminTeamTable } from "./admin-management/admin-team-table";
import { AuditLogTable } from "./admin-management/audit-log-table";
import { InviteAdminModal } from "./admin-management/invite-admin-modal";
import { mockAuditLogs } from "./admin-management/types";

const ADMIN_PERMISSIONS = { WRITE: "admins:write", DELETE: "admins:delete" } as const;

/** Rows fetched per page as the user scrolls. */
const PAGE_SIZE = 20;

export function AdminManagement() {
  const { profile } = useAdminProfile();
  const [search, setSearch] = useState("");

  const { adminsListQuery, admins } = useAdminAdminsList({
    pageSize: PAGE_SIZE,
    ...(search ? { search } : {}),
  });
  const infiniteScrollRef = useInfiniteScroll({
    hasNextPage: adminsListQuery.hasNextPage,
    isFetchingNextPage: adminsListQuery.isFetchingNextPage,
    fetchNextPage: adminsListQuery.fetchNextPage,
  });

  const listErrorMessage = adminsListQuery?.error?.message;

  const { updateAdminMutation } = useUpdateAdmin();
  const { removeAdminMutation } = useRemoveAdmin();
  const { resendAdminInviteMutation } = useResendAdminInvite();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [revokeAdmin, setRevokeAdmin] = useState<AdminUserResponseDto | null>(null);
  const [activityAdmin, setActivityAdmin] = useState<AdminUserResponseDto | null>(null);

  const handleResendInvite = (admin: AdminUserResponseDto) => {
    resendAdminInviteMutation.mutate(admin.id, {
      onSuccess: () => {
        toast.success(`Invite resent to ${getUserEmail(admin)}`, {
          description: "They'll receive a new 6-digit code, valid for 24 hours.",
        });
      },
      onError: (error) => toast.error(error.message || "Unable to resend the invite."),
    });
  };

  const handleRevoke = () => {
    if (!revokeAdmin) return;
    removeAdminMutation.mutate(revokeAdmin.id, {
      onSuccess: () => {
        toast.success(`Access revoked for ${getUserDisplayName(revokeAdmin)}`);
        setRevokeAdmin(null);
      },
      onError: (error) => toast.error(error.message || "Unable to revoke access."),
    });
  };

  const handleRestore = (admin: AdminUserResponseDto) => {
    updateAdminMutation.mutate(
      { id: admin.id, updateAdminDto: { status: UpdateAdminDtoStatusEnum.Active } },
      {
        onSuccess: () => toast.success(`Access restored for ${getUserDisplayName(admin)}`),
        onError: (error) => toast.error(error.message || "Unable to restore access."),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* No stats API yet — placeholders until a dedicated endpoint exists (no extra list calls). */}
      <AdminStats total={0} active={0} disabled={0} />

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Admin Team</CardTitle>
        </CardHeader>
        <CardContent>
          {adminsListQuery?.isError ? (
            <CustomRetryState
              title="Unable to load admins"
              description={listErrorMessage || "Please try again."}
              onRetry={() => adminsListQuery.refetch()}
              isRetrying={adminsListQuery.isRefetching}
              className="min-h-62.5"
            />
          ) : (
            <AdminTeamTable
              admins={admins}
              infiniteScrollRef={infiniteScrollRef}
              isFetchingNextPage={adminsListQuery.isFetchingNextPage}
              search={search}
              onSearch={setSearch}
              isLoading={!profile || adminsListQuery.isPending}
              currentAdminId={profile?.id}
              isViewerSuperAdmin={profile?.roles.includes(SystemRoleName.SuperAdmin) ?? false}
              canWrite={profile?.permissions.includes(ADMIN_PERMISSIONS.WRITE) ?? false}
              canDelete={profile?.permissions.includes(ADMIN_PERMISSIONS.DELETE) ?? false}
              onInvite={() => setInviteModalOpen(true)}
              onResendInvite={handleResendInvite}
              onDisable={setRevokeAdmin}
              onEnable={handleRestore}
              onViewActivity={setActivityAdmin}
            />
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogTable logs={mockAuditLogs} />
        </CardContent>
      </Card>

      <InviteAdminModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />

      <CustomConfirmationModal
        open={Boolean(revokeAdmin)}
        onOpenChange={(open) => !open && setRevokeAdmin(null)}
        title="Revoke Access?"
        description={
          revokeAdmin
            ? `${getUserDisplayName(revokeAdmin)} (${getUserEmail(revokeAdmin)}) will no longer be able to access the admin console. You can restore access later.`
            : ""
        }
        confirmText="Revoke Access"
        confirmVariant="destructive"
        onConfirm={handleRevoke}
        isConfirming={removeAdminMutation.isPending}
      />

      <ActivityHistoryModal
        admin={activityAdmin}
        open={Boolean(activityAdmin)}
        onOpenChange={(open) => !open && setActivityAdmin(null)}
      />
    </div>
  );
}
