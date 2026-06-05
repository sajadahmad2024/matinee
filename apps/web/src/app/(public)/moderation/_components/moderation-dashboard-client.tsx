"use client";

import { useState } from "react";

import { type ModerationTicket, ModerationTicketList } from "./moderation-ticket-list";
import { TicketResolutionModal } from "./ticket-resolution-modal";

interface ModerationDashboardClientProps {
  searchQuery: string;
  typeFilter: string;
  severityFilter: string;
  categoryFilter: string;
  page: number;
  pageSize: number;
}

export function ModerationDashboardClient({
  searchQuery,
  typeFilter,
  severityFilter,
  categoryFilter,
  page,
  pageSize,
}: ModerationDashboardClientProps) {
  const [selectedTicket, setSelectedTicket] = useState<ModerationTicket | null>(null);

  const handleOpenTicket = (ticket: ModerationTicket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

  const handleResolveTicket = (ticketId: string, action: string) => {
    console.warn(`Resolved ticket ${ticketId} with action: ${action}`);
    // Optional: Refresh data or optimistic update here
  };

  const handleNextTicket = () => {
    setSelectedTicket(null); // Simple close for now. Could find next in array later.
  };

  return (
    <div>
      <h2 className="text-foreground mb-4 text-lg font-semibold">Pending Tickets</h2>

      <ModerationTicketList
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        severityFilter={severityFilter}
        categoryFilter={categoryFilter}
        page={page}
        pageSize={pageSize}
        onOpenTicket={handleOpenTicket}
      />

      <TicketResolutionModal
        ticket={selectedTicket}
        onClose={handleCloseTicket}
        onResolve={handleResolveTicket}
        onNext={handleNextTicket}
      />
    </div>
  );
}
