"use client";

import { useMemo, useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Ban, ChevronRight, MinusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

import {
  type ConfirmationAction,
  ConfirmationDialog,
} from "@/components/custom/confirmation-dialog";
import { type Column, DataTable } from "@/components/custom/data-table";
import { TablePagination } from "@/components/custom/table-pagination";

import { GlassCard } from "../../games/_components/glass-card";
import {
  CATEGORY_LABELS,
  MOCK_TICKETS,
  type ModerationTicket,
  SEVERITY_STYLES,
  TYPE_ICONS,
} from "../constants";
import { ModerationFilters } from "./moderation-filters";

export type { ModerationTicket };

interface ModerationTicketListProps {
  searchQuery: string;
  typeFilter: string;
  severityFilter: string;
  categoryFilter: string;
  page: number;
  pageSize: number;
  onOpenTicket: (ticket: ModerationTicket) => void;
}

export function ModerationTicketList({
  searchQuery,
  typeFilter,
  severityFilter,
  categoryFilter,
  page,
  pageSize,
  onOpenTicket,
}: ModerationTicketListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: ConfirmationAction;
  }>({ open: false, action: "ban" });

  const filteredTickets = useMemo(() => {
    return MOCK_TICKETS.filter((ticket) => {
      const matchesSearch =
        ticket.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.offenderName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || ticket.type === typeFilter;
      const matchesSeverity = severityFilter === "all" || ticket.severity === severityFilter;
      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

      return matchesSearch && matchesType && matchesSeverity && matchesCategory;
    });
  }, [searchQuery, typeFilter, severityFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize);

  const paginatedTickets = useMemo(() => {
    return filteredTickets.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredTickets, page, pageSize]);

  const updatePagination = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === "pageSize") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  const handleBulkAction = (action: ConfirmationAction) => {
    setConfirmDialog({ open: true, action });
  };

  const confirmBulkAction = () => {
    toast.success(
      `Successfully processed ${selectedTicketIds.length} tickets with action: ${confirmDialog.action}`,
    );
    setSelectedTicketIds([]);
  };

  const columns: Column<ModerationTicket>[] = [
    {
      header: "Type",
      cell: (ticket) => {
        const Icon = TYPE_ICONS[ticket.type];
        return (
          <div className="flex items-center gap-2">
            <div className="bg-muted rounded p-1.5">
              <Icon className="text-muted-foreground h-4 w-4" />
            </div>
            <span className="text-foreground capitalize">{ticket.type}</span>
          </div>
        );
      },
    },
    {
      header: "Content / Details",
      cell: (ticket) => (
        <div className="max-w-[300px]">
          <p className="text-foreground truncate text-sm font-medium">{ticket.content}</p>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <span>By: {ticket.offenderName}</span>
            {ticket.isRepeatOffender && (
              <Badge variant="outline" className="text-[10px]">
                Repeat Offender
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (ticket) => (
        <span className="text-muted-foreground text-sm">{CATEGORY_LABELS[ticket.category]}</span>
      ),
    },
    {
      header: "Severity",
      cell: (ticket) => (
        <Badge variant="outline" className={SEVERITY_STYLES[ticket.severity]}>
          {ticket.severity.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Reports",
      cell: (ticket) => <span className="text-foreground font-mono">{ticket.reportCount}</span>,
    },
    {
      header: "Time",
      cell: (ticket) => <span className="text-muted-foreground text-sm">{ticket.timestamp}</span>,
    },
    {
      header: "",
      cell: (ticket) => (
        <Button variant="ghost" size="sm" onClick={() => onOpenTicket(ticket)} className="gap-1">
          Review <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filters Component */}
      <ModerationFilters searchQuery={searchQuery} />

      {/* Bulk Actions (Top) */}
      {selectedTicketIds.length > 0 && (
        <div className="bg-accent/10 border-accent/20 flex flex-wrap items-center gap-4 rounded-lg border p-3">
          <span className="text-foreground text-sm font-medium">
            {selectedTicketIds.length} ticket(s) selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("hide")}
              className="gap-2">
              <MinusCircle className="h-4 w-4" />
              Ignore All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("delete")}
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Content
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("ban")}
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
              <Ban className="h-4 w-4" />
              Ban Users
            </Button>
          </div>
        </div>
      )}

      {/* Ticket Table */}
      <GlassCard>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={paginatedTickets}
            rowIdKey="id"
            selectable
            selectedIds={selectedTicketIds}
            onSelectionChange={setSelectedTicketIds}
          />
          <div className="p-4 pt-0">
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredTickets.length}
              onPageChange={(p) => updatePagination("page", p.toString())}
              onPageSizeChange={(s) => updatePagination("pageSize", s.toString())}
            />
          </div>
        </CardContent>
      </GlassCard>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title="Confirm Bulk Action"
        description={`Are you sure you want to apply this action to ${selectedTicketIds.length} ticket(s)? This cannot be undone.`}
        action={confirmDialog.action}
        onConfirm={confirmBulkAction}
      />
    </div>
  );
}
