"use client";

import { useState } from "react";

import { LuPencil } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  getAdminDisplayName,
  getAdminInitials,
  useMockAdminProfile,
} from "@/app/_libs/mock-admin-profile";
import { GlassCard } from "@/components/custom/glass-card";

import { EditProfileModal } from "./edit-profile-modal";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** The signed-in admin's account details, with an Edit Name action (password change comes later). */
export function ProfileView() {
  const profile = useMockAdminProfile();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-gaming text-foreground text-3xl font-bold">Profile</h1>
        <p className="text-foreground-secondary mt-1">Your admin account details.</p>
      </div>

      <GlassCard className="max-w-3xl gap-0 p-0">
        <div className="border-border/50 flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="from-success to-primary flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br">
              <span className="text-primary-foreground text-xl font-semibold">
                {getAdminInitials(profile)}
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-foreground truncate text-xl font-semibold">
                {getAdminDisplayName(profile)}
              </p>
              <p className="text-muted-foreground truncate text-sm">{profile?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="cursor-pointer gap-2"
            onClick={() => setIsEditOpen(true)}>
            <LuPencil className="h-4 w-4" />
            Edit Name
          </Button>
        </div>

        <dl className="grid gap-6 p-6 sm:grid-cols-2">
          <ProfileField label="First Name" value={profile?.firstName} />
          <ProfileField label="Last Name" value={profile?.lastName} />
          <ProfileField label="Email" value={profile?.email} />
          <ProfileField label="Role" value={profile?.roles?.join(", ")} />
          <div className="space-y-1.5">
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Status
            </dt>
            <dd>
              <Badge
                variant="outline"
                className="bg-success/20 border-success/30 text-success capitalize">
                {profile?.status}
              </Badge>
            </dd>
          </div>
          <ProfileField label="Member Since" value={formatDate(profile?.createdAt)} />
        </dl>
      </GlassCard>

      <EditProfileModal open={isEditOpen} onOpenChange={setIsEditOpen} profile={profile} />
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-foreground truncate text-sm font-medium">{value || "-"}</dd>
    </div>
  );
}
