"use client";

import { useState } from "react";

import { LuLogOut } from "react-icons/lu";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

import { ADMIN_ROUTES, AUTH_ROUTES } from "@/app/_libs/constants/routes";
import { useAdminLogout, useAdminProfile } from "@/app/_libs/hooks/api/use-admin-auth";
import { cn } from "@/app/_libs/utils/cn";
import { getUserDisplayName, getUserInitials } from "@/app/_libs/utils/user-display";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomConfirmationModal } from "@/components/custom/custom-confirmation-modal";
import { CustomTooltip } from "@/components/custom/custom-tooltip";

interface SidebarUserProfileProps {
  isCollapsed: boolean;
}

export function SidebarUserProfile({ isCollapsed }: SidebarUserProfileProps) {
  const { adminProfileQuery, profile } = useAdminProfile();
  const { adminLogoutMutation } = useAdminLogout();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const isProfileLoading = adminProfileQuery.isPending;
  const displayName = profile ? getUserDisplayName(profile) : "Admin";
  const initials = profile ? getUserInitials(profile) : "A";

  const handleLogout = () => {
    const leave = () => window.location.replace(AUTH_ROUTES.LOGIN);

    adminLogoutMutation.mutate(undefined, {
      onSuccess: leave,
      onError: (error) => {
        if (error.isUnauthorized) return leave();
        toast.error(error.message || "Unable to log out. Please try again.");
      },
    });
  };

  return (
    <div className="border-sidebar-border border-t p-3">
      <div className="flex items-center">
        <CustomTooltip
          side="right"
          sideOffset={12}
          disabled={!isCollapsed}
          className="overflow-hidden rounded-xl p-0"
          content={
            <div className="flex items-stretch">
              <div className="flex items-center px-4 py-3">
                <p className="text-foreground text-sm font-semibold">{displayName}</p>
              </div>
              <CustomButton
                variant="ghost"
                onClick={() => setIsLogoutOpen(true)}
                aria-label="Log out"
                className="bg-destructive/5 hover:bg-destructive/15 dark:hover:bg-destructive/15 text-destructive/80 dark:text-destructive/80 hover:text-destructive dark:hover:text-destructive border-border/30 h-auto rounded-none border-l px-4 py-3">
                <LuLogOut />
              </CustomButton>
            </div>
          }>
          <a
            href={ADMIN_ROUTES.PROFILE}
            aria-label="View profile"
            className="from-success to-primary flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-linear-to-br transition-all duration-300">
            {isProfileLoading ? (
              <Skeleton className="size-4 rounded-full" />
            ) : (
              <span className="text-primary-foreground text-sm font-semibold">{initials}</span>
            )}
          </a>
        </CustomTooltip>

        <div
          className={cn(
            "flex flex-1 items-center justify-between overflow-hidden transition-all duration-400 ease-in-out",
            isCollapsed ? "ml-0 max-w-0" : "ml-3 max-w-48",
          )}>
          <div className="overflow-hidden">
            {isProfileLoading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <a
                href={ADMIN_ROUTES.PROFILE}
                className="text-foreground hover:text-primary block truncate text-sm font-semibold whitespace-nowrap transition-colors"
                title={displayName}>
                {displayName}
              </a>
            )}
          </div>
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={() => setIsLogoutOpen(true)}
            aria-label="Log out"
            className="text-muted-foreground dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive size-8 shrink-0 hover:bg-transparent dark:hover:bg-transparent">
            <LuLogOut />
          </CustomButton>
        </div>
      </div>

      <CustomConfirmationModal
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        title="Log Out?"
        description="Are you sure you want to log out? You'll need to sign in again to access the admin console."
        cancelText="Cancel"
        confirmText="Yes, Log Out"
        confirmVariant="destructive"
        onConfirm={handleLogout}
        isConfirming={adminLogoutMutation.isPending}
      />
    </div>
  );
}
