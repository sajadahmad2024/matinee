"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ActivityHistoryModal } from "./admin-management/activity-history-modal";
import { AdminStats } from "./admin-management/admin-stats";
import { AdminTeamTable } from "./admin-management/admin-team-table";
import { AuditLogTable } from "./admin-management/audit-log-table";
import { InviteAdminModal } from "./admin-management/invite-admin-modal";
import { type Admin, mockAdmins, mockAuditLogs } from "./admin-management/types";

export function AdminManagement() {
  const [admins, setAdmins] = useState(mockAdmins);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const handleInvite = (adminData: Partial<Admin>) => {
    const newAdmin: Admin = {
      id: crypto.randomUUID(),
      name: adminData.name || "",
      email: adminData.email || "",
      avatar: "",
      role: adminData.role || "admin",
      status: "invited",
      lastActive: "-",
      has2FA: false,
    };
    setAdmins((prev) => [...prev, newAdmin]);
    toast.success(`Invitation sent to ${newAdmin.email}`);
  };

  const handleRevoke = (adminId: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    toast.success("Admin access revoked");
  };

  const handleViewActivity = (admin: Admin) => {
    setSelectedAdmin(admin);
    setActivityModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminStats admins={admins} />

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Admin Team</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTeamTable
            admins={admins}
            onInvite={() => setInviteModalOpen(true)}
            onViewActivity={handleViewActivity}
            onRevoke={handleRevoke}
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogTable logs={mockAuditLogs} />
        </CardContent>
      </Card>

      <InviteAdminModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={handleInvite}
      />

      <ActivityHistoryModal
        admin={selectedAdmin}
        open={activityModalOpen}
        onOpenChange={setActivityModalOpen}
      />
    </div>
  );
}
