"use client";

import { useMemo, useState } from "react";

import {
  Ban,
  Bell,
  ChevronRight,
  EyeOff,
  MessageSquare,
  MinusCircle,
  Trash2,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  type ConfirmationAction,
  ConfirmationDialog,
} from "@/components/custom/confirmation-dialog";
import { type Column, DataTable } from "@/components/custom/data-table";
import { TablePagination } from "@/components/custom/table-pagination";

import { ModerationFilters } from "./moderation-filters";

export interface ModerationTicket {
  id: string;
  type: "comment" | "video" | "user";
  severity: "high" | "medium" | "low";
  category: "hate_speech" | "spam" | "nudity" | "harassment" | "other";
  content: string;
  offenderName: string;
  offenderId: string;
  reportCount: number;
  timestamp: string;
  isRepeatOffender: boolean;
}

const mockTickets: ModerationTicket[] = [
  {
    id: "1",
    type: "comment",
    severity: "high",
    category: "hate_speech",
    content: "This is an example of flagged content that violates community guidelines...",
    offenderName: "ToxicUser42",
    offenderId: "u1",
    reportCount: 12,
    timestamp: "10 mins ago",
    isRepeatOffender: true,
  },
  {
    id: "2",
    type: "video",
    severity: "medium",
    category: "spam",
    content: "Promotional video with misleading title and clickbait thumbnail",
    offenderName: "SpammerBot",
    offenderId: "u2",
    reportCount: 8,
    timestamp: "25 mins ago",
    isRepeatOffender: false,
  },
  {
    id: "3",
    type: "user",
    severity: "high",
    category: "harassment",
    content: "User profile with offensive bio and targeted harassment history",
    offenderName: "HarasserAccount",
    offenderId: "u3",
    reportCount: 15,
    timestamp: "1 hour ago",
    isRepeatOffender: true,
  },
  {
    id: "4",
    type: "comment",
    severity: "low",
    category: "spam",
    content: "Check out my channel for free stuff! Link in bio...",
    offenderName: "PromoGuy",
    offenderId: "u4",
    reportCount: 3,
    timestamp: "2 hours ago",
    isRepeatOffender: false,
  },
  {
    id: "5",
    type: "video",
    severity: "high",
    category: "nudity",
    content: "Video thumbnail contains inappropriate imagery",
    offenderName: "NSFWUploader",
    offenderId: "u5",
    reportCount: 22,
    timestamp: "3 hours ago",
    isRepeatOffender: true,
  },
  {
    id: "6",
    type: "comment",
    severity: "medium",
    category: "harassment",
    content: "Targeted insults directed at another user in comments",
    offenderName: "AngryCommenter",
    offenderId: "u6",
    reportCount: 6,
    timestamp: "4 hours ago",
    isRepeatOffender: false,
  },
];

const typeIcons = {
  comment: MessageSquare,
  video: Video,
  user: User,
};

const severityStyles = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-muted/20 text-muted-foreground border-muted/30",
};

const categoryLabels = {
  hate_speech: "Hate Speech",
  spam: "Spam",
  nudity: "Nudity",
  harassment: "Harassment",
  other: "Other",
};

interface ModerationTicketListProps {
  onOpenTicket: (ticket: ModerationTicket) => void;
}

export function ModerationTicketList({ onOpenTicket }: ModerationTicketListProps) {
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: ConfirmationAction;
    label: string;
  }>({ open: false, action: "delete", label: "comment" });

  const filteredTickets = useMemo(() => {
    return mockTickets.filter((ticket) => {
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
    return filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  const openConfirmDialog = (action: ConfirmationAction, label: string) => {
    setConfirmDialog({ open: true, action, label });
  };

  const confirmBulkAction = () => {
    toast.success(
      `${confirmDialog.action} completed for ${selectedTicketIds.length} ${confirmDialog.label}(s)`,
    );
    setSelectedTicketIds([]);
    setConfirmDialog({ open: false, action: "delete", label: "comment" });
  };

  const columns: Column<ModerationTicket>[] = [
    {
      header: "Severity",
      className: "w-[100px]",
      cell: (ticket) => (
        <Badge variant="outline" className={severityStyles[ticket.severity]}>
          {ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Type",
      className: "w-[60px]",
      cell: (ticket) => {
        const TypeIcon = typeIcons[ticket.type];
        return (
          <div className="bg-accent/20 flex h-8 w-8 items-center justify-center rounded-lg">
            <TypeIcon className="text-accent h-4 w-4" />
          </div>
        );
      },
    },
    {
      header: "Content",
      cell: (ticket) => (
        <div>
          <p className="text-foreground line-clamp-1 text-sm">{ticket.content}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-muted-foreground text-xs">{ticket.offenderName}</span>
            {ticket.isRepeatOffender && (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/30 px-1.5 py-0 text-[10px]">
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
        <span className="text-muted-foreground text-sm">{categoryLabels[ticket.category]}</span>
      ),
    },
    {
      header: "Reported By",
      cell: (ticket) => (
        <span className="text-foreground text-sm font-medium">{ticket.reportCount} users</span>
      ),
    },
    {
      header: "Time",
      accessorKey: "timestamp",
      className: "text-muted-foreground text-sm",
    },
    {
      header: "",
      className: "w-[50px]",
      cell: () => <ChevronRight className="text-muted-foreground h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      <ModerationFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      {/* Table */}
      <div className="bg-card/50 rounded-xl">
        <DataTable
          columns={columns}
          data={paginatedTickets}
          rowIdKey="id"
          selectable
          selectedIds={selectedTicketIds}
          onSelectionChange={setSelectedTicketIds}
          onRowClick={onOpenTicket}
        />

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredTickets.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Bulk Action Bar */}
      {selectedTicketIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Card className="border-border bg-card shadow-lg">
            <CardContent className="flex items-center gap-3 p-3">
              <span className="text-foreground px-2 text-sm font-medium">
                {selectedTicketIds.length} selected
              </span>
              <div className="bg-border h-6 w-px" />
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                onClick={() => openConfirmDialog("delete", "comment")}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => openConfirmDialog("hide", "comment")}>
                <EyeOff className="h-4 w-4" />
                Hide
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => openConfirmDialog("ban", "user")}>
                <Ban className="h-4 w-4" />
                Ban Users
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => openConfirmDialog("warn", "user")}>
                <Bell className="h-4 w-4" />
                Warn
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-warning hover:text-warning hover:bg-warning/10 gap-2"
                onClick={() => openConfirmDialog("custom", "user")}>
                <MinusCircle className="h-4 w-4" />
                XP Fine
              </Button>
              <div className="bg-border h-6 w-px" />
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicketIds([])}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={`${confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)} ${selectedTicketIds.length} ${confirmDialog.label}${selectedTicketIds.length > 1 ? "s" : ""}?`}
        description={`Are you sure you want to ${confirmDialog.action} ${selectedTicketIds.length} ${confirmDialog.label}${selectedTicketIds.length > 1 ? "s" : ""}? This action cannot be undone.`}
        action={confirmDialog.action}
        onConfirm={confirmBulkAction}
      />
    </div>
  );
}
