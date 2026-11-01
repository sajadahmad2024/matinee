import type { BadgeFormValues } from "@/app/_libs/schemas/games";

import {
  type BadgeDto,
  type BadgeOperator,
  BadgeOperatorEnum,
  type CreateBadgeDto,
  type UpdateBadgeDto,
} from "../../_libs/game-types";

const isOperator = (value?: string | null): value is BadgeOperator =>
  Object.values(BadgeOperatorEnum).includes(value as BadgeOperator);

/** Form defaults: empty for a new badge, the badge's values when editing. */
export function toBadgeFormValues(badge?: BadgeDto | null): Partial<BadgeFormValues> {
  if (!badge) {
    return {
      name: "",
      description: "",
      triggerKey: "",
      activeIconMediaId: null,
      inactiveIconMediaId: null,
    };
  }
  return {
    name: badge.name,
    description: badge.description ?? "",
    triggerKey: badge.triggerKey ?? "",
    operator: isOperator(badge.operator) ? badge.operator : undefined,
    threshold: badge.threshold ?? undefined,
    rewardPoints: badge.rewardPoints,
    activeIconMediaId: badge.activeIconMediaId ?? null,
    inactiveIconMediaId: badge.inactiveIconMediaId ?? null,
  };
}

/** Form values → the create body. */
export function toBadgeDto(values: BadgeFormValues): CreateBadgeDto {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    triggerKey: values.triggerKey,
    operator: values.operator,
    threshold: values.threshold,
    rewardPoints: values.rewardPoints ?? 0,
    activeIconMediaId: values.activeIconMediaId ?? undefined,
    inactiveIconMediaId: values.inactiveIconMediaId ?? undefined,
  };
}

/**
 * Form values → the update body. An icon only goes out when it changed: a new media id replaces
 * it, `null` removes it.
 */
export function toUpdateBadgeDto(values: BadgeFormValues, badge: BadgeDto): UpdateBadgeDto {
  const { activeIconMediaId, inactiveIconMediaId, ...rest } = toBadgeDto(values);
  return {
    ...rest,
    ...(values.activeIconMediaId !== (badge?.activeIconMediaId ?? null) && {
      activeIconMediaId: values.activeIconMediaId,
    }),
    ...(values.inactiveIconMediaId !== (badge?.inactiveIconMediaId ?? null) && {
      inactiveIconMediaId: values.inactiveIconMediaId,
    }),
  };
}
