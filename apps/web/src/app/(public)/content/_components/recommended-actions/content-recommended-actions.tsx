"use client";

import { RecommendedActionDtoKeyEnum as ActionKey } from "@/app/_libs/api/generated";
import { useRecommendedActions } from "@/app/_libs/hooks/api/use-admin-content";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { FloatingRecommendedActions } from "@/components/custom/floating-recommended-actions";
import type { RecommendedAction } from "@/components/custom/recommended-actions";

import { CONTENT_ROUTES, ContentSection } from "../../_shared/content-config";
import type { ContentRegionKey } from "../../_shared/content-types";
import { ContentTab } from "../listing/listing-config";

/** Where each backend rule is handled — the API sends a stable `key`, the client owns the route. */
const ACTION_HREFS: Record<ActionKey, string> = {
  [ActionKey.PendingReview]: `${CONTENT_ROUTES.LIST}?tab=${ContentTab.Requests}`,
  [ActionKey.LicensesExpiring]: `${CONTENT_ROUTES.LIST}?section=${ContentSection.Licensing}`,
  [ActionKey.RejectedFollowup]: `${CONTENT_ROUTES.LIST}?tab=${ContentTab.Rejected}`,
};

/**
 * The floating Recommended Actions panel (`GET /admin/content/recommended-actions`, region-scoped).
 * The API sends only the rules that matched, with their copy; the panel hides when there are none.
 */
export function ContentRecommendedActions({ region }: { region: ContentRegionKey }) {
  const { recommendedActions } = useRecommendedActions(region === ALL_REGIONS ? undefined : region);

  const actions: RecommendedAction[] = recommendedActions?.map((action) => ({
    title: action?.title,
    detail: action?.detail,
    severity: action?.severity,
    cta: action?.cta,
    href: ACTION_HREFS[action?.key],
  }));

  return <FloatingRecommendedActions actions={actions} />;
}
