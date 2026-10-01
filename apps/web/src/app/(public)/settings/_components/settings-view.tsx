"use client";

import type { ComponentType } from "react";

import {
  Bell,
  Coins,
  FileText,
  Flag,
  Gamepad2,
  Gift,
  Lock,
  type LucideIcon,
  Smartphone,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTabParam } from "@/app/_libs/use-tab-param";
import { AdminHealthSummary, type HealthStat } from "@/components/custom/admin-health-summary";

import { AdminManagement } from "./admin-management";
import { AppVersionSettings } from "./app-version-settings";
import { FeatureFlagsSettings } from "./feature-flags-settings";
import { NotificationCampaigns } from "./notification-campaigns";
import { ReferralEconomySettings } from "./referral-economy-settings";
import { StaticPagesSettings } from "./static-page-editor/static-pages-settings";

// Configuration overview — summarises active reward systems before editing details.
const CONFIG_OVERVIEW: HealthStat[] = [
  {
    label: "Referral Program",
    value: "Active",
    insight: "500 pts · max 10/mo",
    tone: "good",
    icon: Gift,
  },
  {
    label: "Game Centre",
    value: "Enabled",
    insight: "5 formats live",
    tone: "good",
    icon: Gamepad2,
  },
];

const SETTINGS_TABS: {
  value: string;
  label: string;
  icon: LucideIcon;
  Content: ComponentType;
}[] = [
  { value: "economy", label: "Economy", icon: Coins, Content: ReferralEconomySettings },
  { value: "admins", label: "Admin Management", icon: Users, Content: AdminManagement },
  { value: "appversion", label: "App Version", icon: Smartphone, Content: AppVersionSettings },
  { value: "flags", label: "Feature Flags", icon: Flag, Content: FeatureFlagsSettings },
  { value: "notifications", label: "Notifications", icon: Bell, Content: NotificationCampaigns },
  { value: "pages", label: "Static Pages", icon: FileText, Content: StaticPagesSettings },
];

export function SettingsView() {
  const [tabParam, setActiveTab] = useTabParam("economy");
  const activeTab = SETTINGS_TABS.some((tab) => tab.value === tabParam) ? tabParam : "economy";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-gaming text-foreground text-3xl font-bold">Settings</h1>
            <Badge variant="outline" className="bg-warning/20 border-warning/30 text-warning">
              <Lock className="mr-1 h-3 w-3" />
              Owner Only
            </Badge>
          </div>
          <p className="text-foreground-secondary mt-1">
            Configure system-wide settings and admin access.
          </p>
        </div>
      </div>

      {/* Configuration Overview — active systems summarised before editing individual settings */}
      <section className="space-y-3">
        <h2 className="text-foreground text-lg font-semibold">Configuration Overview</h2>
        <AdminHealthSummary stats={CONFIG_OVERVIEW} columns={3} />
      </section>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="border-border/50 bg-background/50 border p-1">
          {SETTINGS_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SETTINGS_TABS.map(({ value, Content }) => (
          <TabsContent key={value} value={value} className="mt-0">
            <Content />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
