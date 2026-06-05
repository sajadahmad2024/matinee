"use client";

import { useMemo, useState } from "react";

import { History, MoreHorizontal, RefreshCcw, Search, XCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { type Column, DataTable } from "@/components/custom/data-table";

import { BillingHistoryModal } from "./subscriber-list/billing-history-modal";
import { CancelSubscriptionModal } from "./subscriber-list/cancel-subscription-modal";
import { RefundPaymentModal } from "./subscriber-list/refund-payment-modal";
import { SubscriberStats } from "./subscriber-list/subscriber-stats";
import { type Subscriber, mockSubscribers } from "./subscriber-list/types";

function getStatusBadge(status: Subscriber["planStatus"]) {
  const styles = {
    active: "bg-success/20 text-success border-success/30",
    past_due: "bg-warning/20 text-warning border-warning/30",
    canceled: "bg-muted/20 text-muted-foreground border-muted/30",
    unpaid: "bg-destructive/20 text-destructive border-destructive/30",
  };
  const labels = {
    active: "Active",
    past_due: "Past Due",
    canceled: "Canceled",
    unpaid: "Unpaid",
  };
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}

export function SubscriberList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [historyModal, setHistoryModal] = useState<Subscriber | null>(null);
  const [cancelModal, setCancelModal] = useState<Subscriber | null>(null);
  const [refundModal, setRefundModal] = useState<Subscriber | null>(null);

  const filteredSubscribers = useMemo(() => {
    return mockSubscribers.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || sub.planStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const columns: Column<Subscriber>[] = [
    {
      header: "User",
      cell: (subscriber) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={subscriber.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {subscriber.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground text-sm font-medium">{subscriber.name}</p>
            <p className="text-muted-foreground text-xs">{subscriber.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Plan",
      accessorKey: "planName",
      className: "text-sm text-foreground",
    },
    {
      header: "Status",
      cell: (subscriber) => getStatusBadge(subscriber.planStatus),
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "Next Billing",
      accessorKey: "nextBilling",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "LTV",
      headerClassName: "text-right",
      className: "text-right font-medium text-foreground text-sm",
      cell: (subscriber) => `$${subscriber.ltv.toFixed(2)}`,
    },
    {
      header: "",
      className: "w-[50px]",
      cell: (subscriber) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-border bg-card w-48">
            <DropdownMenuItem onClick={() => setHistoryModal(subscriber)}>
              <History className="mr-2 h-4 w-4" />
              View History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setCancelModal(subscriber)}
              disabled={subscriber.planStatus === "canceled"}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Subscription
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRefundModal(subscriber)} className="text-warning">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refund Latest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SubscriberStats
        subscribers={mockSubscribers}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search subscribers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background/50 pl-9"
        />
      </div>

      <DataTable columns={columns} data={filteredSubscribers} rowIdKey="id" />

      <BillingHistoryModal
        subscriber={historyModal}
        open={!!historyModal}
        onOpenChange={() => setHistoryModal(null)}
      />

      <CancelSubscriptionModal
        subscriber={cancelModal}
        open={!!cancelModal}
        onOpenChange={() => setCancelModal(null)}
        onConfirm={(option) => {
          console.warn("Canceling subscription:", option);
          setCancelModal(null);
        }}
      />

      <RefundPaymentModal
        subscriber={refundModal}
        open={!!refundModal}
        onOpenChange={() => setRefundModal(null)}
        onConfirm={() => {
          console.warn("Refunding payment");
          setRefundModal(null);
        }}
      />
    </div>
  );
}
