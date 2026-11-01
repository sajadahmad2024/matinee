"use client";

import type { ReactNode } from "react";

import { BarChart3, Settings } from "lucide-react";

import { useTabParam } from "@/app/_libs/use-tab-param";
import { type CustomTabItem, CustomTabs } from "@/components/custom/custom-tabs";

import type { FormatTab } from "../_libs/game-config";

const TABS: CustomTabItem<FormatTab>[] = [
  { value: "settings", label: "Settings", icon: Settings },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
];

interface FormatTabsProps {
  settings: ReactNode;
  analytics: ReactNode;
}

/**
 * Settings | Analytics, kept in `?tab=`. Two tabs only — the former Gamification tab is merged
 * into Settings (client decision), so legacy `?tab=gamification` links land on Settings.
 */
export function FormatTabs({ settings, analytics }: FormatTabsProps) {
  const [tabParam, setTab] = useTabParam("settings");
  const tab: FormatTab = tabParam === "analytics" ? "analytics" : "settings";

  return (
    <div className="space-y-8">
      <CustomTabs
        items={TABS}
        value={tab}
        onValueChange={setTab}
        className="bg-muted/30 h-9 p-1"
        triggerClassName="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      />
      {/* Settings stays mounted (hidden) on Analytics: unsaved edits survive the switch, and the
          header's Save still finds the settings form. Analytics loads only when opened. */}
      <div hidden={tab !== "settings"}>{settings}</div>
      {tab === "analytics" && analytics}
    </div>
  );
}
