"use client";

import {
  Bell,
  Coins,
  Flag,
  Gamepad2,
  Gift,
  Lock,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminHealthSummary, type HealthStat } from "@/components/custom/admin-health-summary";

// Configuration overview — summarises active reward systems before editing details.
const CONFIG_OVERVIEW: HealthStat[] = [
  { label: "Referral Program", value: "Active", insight: "500 pts · max 10/mo", tone: "good", icon: Gift },
  { label: "Daily Login Bonus", value: "Active", insight: "10 pts / day", tone: "good", icon: Coins },
  { label: "Game Centre", value: "Enabled", insight: "5 formats live", tone: "good", icon: Gamepad2 },
];

import { useTabParam } from "@/app/_libs/use-tab-param";

import { AdminManagement } from "./admin-management";
import { AppVersionSettings } from "./app-version-settings";
import { FeatureFlagsSettings } from "./feature-flags-settings";
import { GrowthSettings } from "./growth-settings";
import { NotificationCampaigns } from "./notification-campaigns";
import { ReferralEconomySettings } from "./referral-economy-settings";

const SETTINGS_TABS = ["economy", "admins", "appversion", "flags", "notifications", "growth"];

export function SettingsView() {
  const [tabParam, setActiveTab] = useTabParam("economy");
  // unknown/removed tabs (e.g. an old ?tab=security link) fall back to the first tab
  const activeTab = SETTINGS_TABS.includes(tabParam) ? tabParam : "economy";

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
          <TabsTrigger
            value="economy"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Coins className="h-4 w-4" />
            Economy
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Users className="h-4 w-4" />
            Admin Management
          </TabsTrigger>
          <TabsTrigger
            value="appversion"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Smartphone className="h-4 w-4" />
            App Version
          </TabsTrigger>
          <TabsTrigger
            value="flags"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Flag className="h-4 w-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="growth"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <TrendingUp className="h-4 w-4" />
            Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="economy" className="mt-0">
          <ReferralEconomySettings />
        </TabsContent>


        <TabsContent value="admins" className="mt-0">
          <AdminManagement />
        </TabsContent>

        <TabsContent value="appversion" className="mt-0">
          <AppVersionSettings />
        </TabsContent>

        <TabsContent value="flags" className="mt-0">
          <FeatureFlagsSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <NotificationCampaigns />
        </TabsContent>

        <TabsContent value="growth" className="mt-0">
          <GrowthSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
