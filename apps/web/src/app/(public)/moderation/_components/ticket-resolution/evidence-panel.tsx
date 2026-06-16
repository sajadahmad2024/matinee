"use client";

import { ExternalLink, Flag, User, Video } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { ModerationTicket } from "../moderation-ticket-list";

const mockReporters = [
  { id: "r1", name: "SafeUser123", reason: "Hate speech in comment" },
  { id: "r2", name: "CommunityMod", reason: "Violates guidelines" },
  { id: "r3", name: "RegularViewer", reason: "Offensive language" },
];

interface EvidencePanelProps {
  ticket: ModerationTicket;
}

export function EvidencePanel({ ticket }: EvidencePanelProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase">The Content</h3>
        <div className="bg-accent/10 border-border/50 rounded-lg border p-4">
          {ticket.type === "video" ? (
            <div className="bg-muted/30 mb-3 flex aspect-video items-center justify-center rounded-lg">
              <Video className="text-muted-foreground h-12 w-12" />
            </div>
          ) : null}
          <p className="text-foreground text-sm leading-relaxed">{ticket.content}</p>
          {ticket.type === "comment" && (
            <Button variant="link" className="text-primary mt-2 h-auto gap-1 p-0">
              <ExternalLink className="h-3 w-3" />
              View in context
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase">The Offender</h3>
        <div className="bg-card border-border/50 flex items-center gap-3 rounded-lg border p-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-destructive/20 text-destructive">
              {ticket.offenderName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-foreground font-medium">{ticket.offenderName}</p>
            <p className="text-muted-foreground text-xs">ID: {ticket.offenderId}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <User className="h-3 w-3" />
            View Profile
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase">
          The Reporters ({ticket.reportCount})
        </h3>
        <div className="max-h-[150px] space-y-2 overflow-y-auto">
          {mockReporters.map((reporter) => (
            <div
              key={reporter.id}
              className="hover:bg-accent/10 flex items-center gap-3 rounded-lg p-2">
              <Flag className="text-warning h-4 w-4" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">{reporter.name}</p>
                <p className="text-muted-foreground truncate text-xs">{reporter.reason}</p>
              </div>
            </div>
          ))}
          {ticket.reportCount > 3 && (
            <p className="text-muted-foreground py-1 text-center text-xs">
              +{ticket.reportCount - 3} more reports
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
