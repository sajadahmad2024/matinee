"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { type Admin, mockAuditLogs } from "./types";

interface ActivityHistoryModalProps {
  admin: Admin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityHistoryModal({ admin, open, onOpenChange }: ActivityHistoryModalProps) {
  if (!admin) return null;

  const adminLogs = mockAuditLogs.filter((log) => log.actor === admin.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-lg">
        <DialogHeader>
          <DialogTitle>Activity History</DialogTitle>
          <DialogDescription>Recent actions by {admin.name}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] space-y-3 overflow-y-auto">
          {adminLogs.map((log) => (
            <div
              key={log.id}
              className="border-border/30 bg-accent/10 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-foreground text-sm font-medium">
                  {log.action} {log.target}
                </p>
                <p className="text-muted-foreground text-xs">{log.timestamp}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {log.ip}
              </Badge>
            </div>
          ))}
          {adminLogs.length === 0 && (
            <p className="text-muted-foreground py-4 text-center">No activity found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
