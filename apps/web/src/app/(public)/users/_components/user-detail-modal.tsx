"use client";

import { CreditCard, Gamepad2, Play, Shield, User as UserIcon, Users } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { UserAdminActions } from "./user-admin-actions";
import { UserDetailHeader } from "./user-details/user-detail-header";
import { UserGamesTab } from "./user-details/user-games-tab";
import { UserModerationTab } from "./user-details/user-moderation-tab";
import { UserOverviewTab } from "./user-details/user-overview-tab";
import { UserReferralsTab } from "./user-details/user-referrals-tab";
import { UserWalletTab } from "./user-details/user-wallet-tab";
import { UserWatchTab } from "./user-details/user-watch-tab";
import type { User } from "./user-list-table";

interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailModal({ user, open, onOpenChange }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-h-[90vh] max-w-4xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        <UserDetailHeader user={user} />

        <UserAdminActions user={user} />

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="bg-muted/30 flex h-auto flex-wrap gap-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <UserIcon className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="watch" className="gap-1.5 text-xs">
              <Play className="h-3 w-3" />
              Watch
            </TabsTrigger>
            <TabsTrigger value="games" className="gap-1.5 text-xs">
              <Gamepad2 className="h-3 w-3" />
              Games
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-1.5 text-xs">
              <CreditCard className="h-3 w-3" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-1.5 text-xs">
              <Users className="h-3 w-3" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-1.5 text-xs">
              <Shield className="h-3 w-3" />
              Moderation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <UserOverviewTab user={user} />
          </TabsContent>

          <TabsContent value="watch">
            <UserWatchTab />
          </TabsContent>

          <TabsContent value="games">
            <UserGamesTab />
          </TabsContent>

          <TabsContent value="wallet">
            <UserWalletTab />
          </TabsContent>

          <TabsContent value="referrals">
            <UserReferralsTab />
          </TabsContent>

          <TabsContent value="moderation">
            <UserModerationTab user={user} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
