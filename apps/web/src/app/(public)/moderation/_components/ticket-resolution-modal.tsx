"use client";

import { AlertTriangle, MessageSquare, User, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { ModerationTicket } from "./moderation-ticket-list";
import { ActionPanel } from "./ticket-resolution/action-panel";
import { EvidencePanel } from "./ticket-resolution/evidence-panel";

const typeIcons = {
  comment: MessageSquare,
  video: Video,
  user: User,
};

interface TicketResolutionModalProps {
  ticket: ModerationTicket | null;
  onClose: () => void;
  onResolve: (ticketId: string, action: string) => void;
  onNext: () => void;
}

export function TicketResolutionModal({
  ticket,
  onClose,
  onResolve,
  onNext,
}: TicketResolutionModalProps) {
  if (!ticket) return null;

  const TypeIcon = typeIcons[ticket.type];

  const handleAction = (action: string) => {
    onResolve(ticket.id, action);
    onNext();
  };

  return (
    <Dialog open={!!ticket} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card max-h-[90vh] max-w-4xl! overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 pt-4">
              <div className="bg-destructive/20 flex h-8 w-8 items-center justify-center rounded-lg">
                <TypeIcon className="text-destructive h-4 w-4" />
              </div>
              Moderation Review
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  ticket.severity === "high"
                    ? "bg-destructive/20 text-destructive border-destructive/30"
                    : ticket.severity === "medium"
                      ? "bg-warning/20 text-warning border-warning/30"
                      : "bg-muted/20 text-muted-foreground border-muted/30"
                }>
                {ticket.severity.toUpperCase()} SEVERITY
              </Badge>
              {ticket.isRepeatOffender && (
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/30">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Repeat Offender
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="divide-border grid grid-cols-1 gap-0 lg:grid-cols-2 lg:divide-x">
          <EvidencePanel ticket={ticket} />
          <ActionPanel onAction={handleAction} onClose={onClose} onNext={onNext} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
