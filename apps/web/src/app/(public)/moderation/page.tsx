"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ModerationAnalytics } from "./_components/moderation-analytics";
import { type ModerationTicket, ModerationTicketList } from "./_components/moderation-ticket-list";
import { TicketResolutionModal } from "./_components/ticket-resolution-modal";

export default function ModerationQueuePage() {
  const [timeFilter, setTimeFilter] = useState("24h");
  const [selectedTicket, setSelectedTicket] = useState<ModerationTicket | null>(null);
  const [pendingCount] = useState(67);

  const handleOpenTicket = (ticket: ModerationTicket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

  const handleResolveTicket = (ticketId: string, action: string) => {
    console.warn(`Resolved ticket ${ticketId} with action: ${action}`);
  };

  const handleNextTicket = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Moderation Queue</h1>
          <p className="text-foreground-secondary mt-1">
            Review and manage flagged content, users, and community reports.
          </p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="bg-background/50 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Section */}
      <ModerationAnalytics pendingCount={pendingCount} />

      {/* Ticket List */}
      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">Pending Tickets</h2>
        <ModerationTicketList onOpenTicket={handleOpenTicket} />
      </div>

      {/* Resolution Modal */}
      <TicketResolutionModal
        ticket={selectedTicket}
        onClose={handleCloseTicket}
        onResolve={handleResolveTicket}
        onNext={handleNextTicket}
      />
    </div>
  );
}
