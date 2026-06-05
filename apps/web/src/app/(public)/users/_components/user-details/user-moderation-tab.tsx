"use client";

import { AlertTriangle, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { User } from "../user-list-table";

const moderationHistory = [
  { type: "received", reason: "Spam", date: "Dec 15", status: "Resolved", admin: "Admin_1" },
  { type: "made", reason: "Offensive content", date: "Nov 20", status: "Actioned", admin: "-" },
];

interface UserModerationTabProps {
  user: User;
}

export function UserModerationTab({ user }: UserModerationTabProps) {
  return (
    <div className="mt-4 space-y-4">
      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="text-warning h-4 w-4" />
            Reports Received ({user.reportsCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moderationHistory
            .filter((m) => m.type === "received")
            .map((m, i) => (
              <div
                key={i}
                className="border-border/30 flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <p className="text-foreground text-sm">{m.reason}</p>
                  <p className="text-muted-foreground text-xs">
                    {m.date} • Handled by {m.admin}
                  </p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success">
                  {m.status}
                </Badge>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="text-accent h-4 w-4" />
            Reports Made by User
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moderationHistory
            .filter((m) => m.type === "made")
            .map((m, i) => (
              <div
                key={i}
                className="border-border/30 flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <p className="text-foreground text-sm">{m.reason}</p>
                  <p className="text-muted-foreground text-xs">{m.date}</p>
                </div>
                <Badge variant="outline" className="bg-accent/10 text-accent">
                  {m.status}
                </Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
