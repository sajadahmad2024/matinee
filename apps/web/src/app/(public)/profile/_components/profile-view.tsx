"use client";

import { useState } from "react";

import { LuKeyRound, LuPencil } from "react-icons/lu";

import { Skeleton } from "@/components/ui/skeleton";

import { useAdminProfile } from "@/app/_libs/hooks/api/use-admin-auth";
import {
  formatRoleName,
  getUserDisplayName,
  getUserEmail,
  getUserInitials,
} from "@/app/_libs/utils/user-display";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { GlassCard } from "@/components/custom/glass-card";
import { StatusBadge } from "@/components/custom/status-badge";

import { ChangePasswordModal } from "./change-password-modal";
import { EditProfileModal } from "./edit-profile-modal";

const formatDate = (iso?: string | null) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

/** The signed-in admin's account details, with Edit Name and Change Password actions. */
export function ProfileView() {
  const { adminProfileQuery, profile } = useAdminProfile();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const roles = profile?.roles?.map(formatRoleName)?.join(", ") || "-";

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-gaming text-foreground text-3xl font-bold">Profile</h1>
        <p className="text-foreground-secondary mt-1">Your admin account details.</p>
      </div>

      <GlassCard className="max-w-3xl gap-0 p-0">
        {adminProfileQuery.isError ? (
          <CustomRetryState
            title="Unable to load profile"
            onRetry={() => adminProfileQuery.refetch()}
            isRetrying={adminProfileQuery.isFetching}
          />
        ) : (
          <>
            <div className="border-border/50 flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="from-success to-primary flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br">
                  {profile ? (
                    <span className="text-primary-foreground text-xl font-semibold">
                      {getUserInitials(profile)}
                    </span>
                  ) : (
                    <Skeleton className="bg-muted size-6 rounded-full" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  {profile ? (
                    <>
                      <p className="text-foreground truncate text-xl font-semibold">
                        {getUserDisplayName(profile)}
                      </p>
                      <p className="text-muted-foreground truncate text-sm">
                        {getUserEmail(profile)}
                      </p>
                    </>
                  ) : (
                    <>
                      <Skeleton className="bg-muted h-6 w-40" />
                      <Skeleton className="bg-muted h-4 w-56" />
                    </>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <CustomButton
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                  disabled={!profile}
                  leftIcon={<LuPencil className="h-4 w-4" />}>
                  Edit Name
                </CustomButton>
                <CustomButton
                  variant="outline"
                  onClick={() => setIsPasswordOpen(true)}
                  disabled={!profile}
                  leftIcon={<LuKeyRound className="h-4 w-4" />}>
                  Change Password
                </CustomButton>
              </div>
            </div>

            <dl className="grid gap-6 p-6 sm:grid-cols-2">
              <ProfileField label="First Name" value={profile?.firstName} isLoading={!profile} />
              <ProfileField label="Last Name" value={profile?.lastName} isLoading={!profile} />
              <ProfileField label="Email" value={profile?.email} isLoading={!profile} />
              <ProfileField label="Role" value={roles} isLoading={!profile} />
              <div className="space-y-1.5">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Status
                </dt>
                <dd>
                  {profile ? (
                    <StatusBadge status={profile?.status} />
                  ) : (
                    <Skeleton className="bg-muted h-5 w-16" />
                  )}
                </dd>
              </div>
              <ProfileField
                label="Member Since"
                value={formatDate(profile?.createdAt)}
                isLoading={!profile}
              />
            </dl>
          </>
        )}
      </GlassCard>

      {profile && (
        <EditProfileModal open={isEditOpen} onOpenChange={setIsEditOpen} profile={profile} />
      )}
      <ChangePasswordModal open={isPasswordOpen} onOpenChange={setIsPasswordOpen} />
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value?: string | null;
  isLoading: boolean;
}

function ProfileField({ label, value, isLoading }: ProfileFieldProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-foreground truncate text-sm font-medium">
        {isLoading ? <Skeleton className="bg-muted h-5 w-32" /> : value || "-"}
      </dd>
    </div>
  );
}
