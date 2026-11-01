"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useBadgeTriggers,
  useBadges,
  useDeleteBadge,
  useUpdateBadge,
} from "@/app/_libs/hooks/api/use-admin-games";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { useDialogTarget } from "@/hooks/use-dialog-target";

import type { BadgeDto } from "../../_libs/game-types";
import {
  BADGE_ACTION_DONE,
  BADGE_CONFIRM,
  type BadgeAction,
  type BadgeConfirmAction,
  triggerLabel,
} from "../_libs/badge-config";
import { BadgeCard } from "./badge-card";
import { BadgeFormDialog } from "./badge-form-dialog";
import { BadgeSummaryTiles } from "./badge-summary-tiles";

/**
 * Badge list with its summary tiles. Create and edit open the badge form; each card's menu also
 * activates, and deactivates / deletes after a confirmation.
 */
export function BadgeManagement() {
  const { badgesQuery, badges } = useBadges();
  const { triggers } = useBadgeTriggers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BadgeDto | null>(null);

  const openForm = (badge: BadgeDto | null) => {
    setEditing(badge);
    setDialogOpen(true);
  };

  const { updateBadgeMutation } = useUpdateBadge();
  const { deleteBadgeMutation } = useDeleteBadge();
  const confirm = useDialogTarget<{ badge: BadgeDto; action: BadgeConfirmAction }>();
  const isRunning = updateBadgeMutation.isPending || deleteBadgeMutation.isPending;

  /** The badge an action is running on, for its card's spinner. */
  const busyId = updateBadgeMutation.isPending
    ? updateBadgeMutation.variables?.id
    : deleteBadgeMutation.isPending
      ? deleteBadgeMutation.variables
      : undefined;

  // Activate / deactivate send only `isActive`, so the slug is untouched. A confirmed action keeps
  // its dialog open until the request succeeds; on error it stays open to retry or cancel.
  const run = (badge: BadgeDto, action: BadgeAction) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(`“${badge.name}” ${BADGE_ACTION_DONE[action]}`);
        confirm.onOpenChange(false);
      },
      onError: (error: Error) => toast.error(error.message),
    };
    if (action === "delete") deleteBadgeMutation.mutate(badge.id, callbacks);
    else
      updateBadgeMutation.mutate(
        { id: badge.id, dto: { isActive: action === "activate" } },
        callbacks,
      );
  };

  // activate runs straight from the menu; deactivate and delete ask first
  const onAction = (badge: BadgeDto, action: BadgeAction) =>
    action === "activate" ? run(badge, action) : confirm.show({ badge, action });

  const pending = confirm.target ? BADGE_CONFIRM[confirm.target.action] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Badge Management</h3>
          <p className="text-muted-foreground text-sm">Create static milestones users can earn</p>
        </div>
        <Button className="cursor-pointer gap-2" onClick={() => openForm(null)}>
          <Plus className="h-4 w-4" />
          Create Badge
        </Button>
      </div>

      <BadgeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        badge={editing}
        triggers={triggers}
      />

      {confirm.target && pending && (
        <ConfirmationDialog
          open={confirm.open}
          onOpenChange={confirm.onOpenChange}
          title={pending.title}
          description={pending.description(confirm.target.badge)}
          action={confirm.target.action === "delete" ? "delete" : "custom"}
          confirmLabel={pending.confirmLabel}
          destructive={confirm.target.action === "delete"}
          isLoading={isRunning}
          onConfirm={() => confirm.target && run(confirm.target.badge, confirm.target.action)}
        />
      )}

      {badgesQuery.isError ? (
        <CustomRetryState
          title="Couldn't load badges"
          description={badgesQuery.error?.message}
          onRetry={() => void badgesQuery.refetch()}
          isRetrying={badgesQuery.isFetching}
        />
      ) : badgesQuery.isPending ? (
        <Skeleton className="bg-muted/20 h-[400px] w-full rounded-xl" />
      ) : (
        <>
          <BadgeSummaryTiles />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges?.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                triggerLabel={triggerLabel(triggers, badge.triggerKey)}
                onEdit={openForm}
                onAction={onAction}
                isBusy={busyId === badge.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
