"use client";

import { useState } from "react";

import { Coins, Lock, Shield, Smartphone, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminManagement } from "./_components/admin-management";
import { AppVersionSettings } from "./_components/app-version-settings";
import { ReferralEconomySettings } from "./_components/referral-economy-settings";
import { SecurityAccessSettings } from "./_components/security-access-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("economy");

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
            Configure system-wide settings, security, and admin access.
          </p>
        </div>
      </div>

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
            value="security"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Shield className="h-4 w-4" />
            Security
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
        </TabsList>

        <TabsContent value="economy" className="mt-0">
          <ReferralEconomySettings />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <SecurityAccessSettings />
        </TabsContent>

        <TabsContent value="admins" className="mt-0">
          <AdminManagement />
        </TabsContent>

        <TabsContent value="appversion" className="mt-0">
          <AppVersionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
