"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BarChart3, Eye, Pause, Pencil, Play, Rocket, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { AdCampaignAction } from "@/app/_libs/hooks/api/use-admin-ads";
import { type CustomAction, CustomActionsMenu } from "@/components/custom/custom-actions-menu";

import { AD_ROUTES } from "../_libs/ad-config";
import type { AdCampaignDto } from "../_libs/ad-types";
import { AD_ACTION_LABELS, canEditAd, canRunAdAction, hasAdAnalytics } from "./ad-status-actions";

interface AdRowActionsProps {
  campaign: AdCampaignDto;
  onAction: (campaign: AdCampaignDto, action: AdCampaignAction) => void;
  isPending?: boolean;
  /** The list URL the opened pages go back to. */
  returnTo?: string;
}

/** View / analytics shortcuts and the ⋯ menu (edit + the status actions the ad allows). */
export function AdRowActions({ campaign, onAction, isPending, returnTo }: AdRowActionsProps) {
  const router = useRouter();

  const statusAction = (
    action: AdCampaignAction,
    icon: CustomAction["icon"],
    extra?: Partial<CustomAction>,
  ) => ({
    label: AD_ACTION_LABELS[action],
    icon,
    hidden: !canRunAdAction(campaign?.status, action),
    onClick: () => onAction(campaign, action),
    ...extra,
  });

  const actions: CustomAction[] = [
    {
      label: "Edit",
      icon: Pencil,
      hidden: !canEditAd(campaign?.status),
      onClick: () => router.push(AD_ROUTES.edit(campaign?.id, returnTo)),
    },
    statusAction("activate", Rocket, { tone: "success" }),
    statusAction("pause", Pause),
    statusAction("resume", Play, { tone: "success" }),
    statusAction("end", Square, { tone: "destructive", separatorBefore: true }),
  ];

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View details">
        <Link href={AD_ROUTES.details(campaign?.id, returnTo)} aria-label="View details">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      {hasAdAnalytics(campaign?.status) && (
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View analytics">
          <Link href={AD_ROUTES.analytics(campaign?.id, returnTo)} aria-label="View analytics">
            <BarChart3 className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <CustomActionsMenu
        actions={actions}
        label={`Actions for “${campaign?.name}”`}
        isLoading={isPending}
      />
    </div>
  );
}
