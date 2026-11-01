import { type ReactNode, Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "@/components/custom/page-header";

import { GAME_ROUTES, type GameFormat } from "../_libs/game-config";
import type { GameRegion } from "../_libs/game-types";
import { FormatAnalytics } from "./format-analytics/format-analytics";
import { FormatHeaderActions } from "./format-header-actions";
import { FormatTabs } from "./format-tabs";

interface FormatPageShellProps {
  format: GameFormat;
  /** The `?region=` lens for the Analytics tab. */
  region: GameRegion;
  /** The format's Settings tab. */
  settings: ReactNode;
  /**
   * Header Cancel / Save Changes (they submit the Settings tab's form). Off for tabs whose cards
   * save themselves (Weekly Quests).
   */
  headerActions?: boolean;
}

/** Everything a format page shares: header (back, icon, Cancel/Save) and Settings | Analytics. */
export function FormatPageShell({
  format,
  region,
  settings,
  headerActions = true,
}: FormatPageShellProps) {
  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <PageHeader
        title={format.name}
        subtitle="Manage format settings and view analytics"
        backHref={GAME_ROUTES.LIST}
        backLabel="Back to Game Management"
        icon={format.icon}
        className="sm:items-center"
        actions={headerActions ? <FormatHeaderActions /> : undefined}
      />
      <Suspense fallback={<Skeleton className="bg-muted/20 h-[600px] w-full rounded-xl" />}>
        <FormatTabs
          settings={settings}
          analytics={<FormatAnalytics ruleKey={format.ruleKey} region={region} />}
        />
      </Suspense>
    </div>
  );
}
