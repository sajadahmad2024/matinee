import Image from "next/image";

import { Pencil, Power, PowerOff, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CustomActionsMenu } from "@/components/custom/custom-actions-menu";
import { GlassCard } from "@/components/custom/glass-card";
import { StatusBadge } from "@/components/custom/status-badge";

import { BADGE_OPERATOR_LABELS } from "../../_libs/game-config";
import type { BadgeDto, BadgeOperator } from "../../_libs/game-types";
import { type BadgeAction, DEFAULT_BADGE_ICON as Icon } from "../_libs/badge-config";

interface BadgeCardProps {
  badge: BadgeDto;
  /** The criteria's trigger, as the catalog labels it. */
  triggerLabel: string;
  onEdit: (badge: BadgeDto) => void;
  onAction: (badge: BadgeDto, action: BadgeAction) => void;
  /** An action on this badge is running: spinner on the menu trigger. */
  isBusy?: boolean;
}

/**
 * One badge: icon (its earned-state image, else the default), name, criteria (trigger · operator · threshold), earned count and bonus, with
 * an actions menu (edit, activate / deactivate, delete).
 */
export function BadgeCard({ badge, triggerLabel, onEdit, onAction, isBusy }: BadgeCardProps) {
  const operatorLabel = BADGE_OPERATOR_LABELS[badge.operator as BadgeOperator] ?? badge.operator;

  return (
    <GlassCard
      className={!badge.isActive ? "opacity-60" : "hover:border-accent/30 transition-colors"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {badge?.activeIconUrl ? (
              <div className="bg-muted/30 relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={badge.activeIconUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="48px"
                  className={`object-contain p-1.5 ${!badge.isActive ? "grayscale" : ""}`}
                />
              </div>
            ) : (
              <div
                className={`rounded-xl p-3 ${badge.isActive ? "from-accent/20 to-accent/5 text-accent bg-gradient-to-br" : "bg-muted/50 text-muted-foreground"}`}>
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                {badge.name}
                <StatusBadge status={badge.isActive ? "active" : "inactive"} className="text-xs" />
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-xs">{badge.description}</p>
            </div>
          </div>
          <CustomActionsMenu
            label={`Actions for ${badge.name}`}
            isLoading={isBusy}
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => onEdit(badge) },
              {
                label: badge.isActive ? "Deactivate" : "Activate",
                icon: badge.isActive ? PowerOff : Power,
                tone: badge.isActive ? "default" : "success",
                onClick: () => onAction(badge, badge.isActive ? "deactivate" : "activate"),
                disabled: isBusy,
              },
              {
                label: "Delete",
                icon: Trash2,
                tone: "destructive",
                separatorBefore: true,
                onClick: () => onAction(badge, "delete"),
                disabled: isBusy,
              },
            ]}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs">
          <span className="text-accent">{triggerLabel}</span>{" "}
          <span className="text-muted-foreground">{operatorLabel}</span>{" "}
          <span className="text-success">{badge.threshold}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground-secondary text-sm">
              {(badge.earnedCount ?? 0).toLocaleString()} earned
            </span>
          </div>
          {badge.rewardPoints > 0 && (
            <Badge variant="outline" className="text-xs">
              +{badge.rewardPoints} pts
            </Badge>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
