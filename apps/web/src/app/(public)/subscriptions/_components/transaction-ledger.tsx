"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AlertTriangle, DollarSign, RefreshCcw, Search, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type Column, DataTable } from "@/components/custom/data-table";

interface Transaction {
  id: string;
  invoiceId: string;
  userName: string;
  userEmail: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "failed" | "refunded" | "pending";
  planName: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    invoiceId: "INV-2025-0121",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@email.com",
    date: "2025-01-21 14:32",
    amount: 24.99,
    currency: "USD",
    status: "paid",
    planName: "Premium Monthly",
  },
  {
    id: "2",
    invoiceId: "INV-2025-0121-B",
    userName: "Marcus Johnson",
    userEmail: "marcus.j@email.com",
    date: "2025-01-21 12:15",
    amount: 299.99,
    currency: "USD",
    status: "paid",
    planName: "Premium Annual",
  },
  {
    id: "3",
    invoiceId: "INV-2025-0120",
    userName: "Aiko Tanaka",
    userEmail: "aiko.t@email.com",
    date: "2025-01-20 18:45",
    amount: 24.99,
    currency: "USD",
    status: "failed",
    planName: "Premium Monthly",
  },
  {
    id: "4",
    invoiceId: "INV-2025-0120-B",
    userName: "James Wilson",
    userEmail: "jwilson@email.com",
    date: "2025-01-20 09:22",
    amount: 24.99,
    currency: "USD",
    status: "refunded",
    planName: "Premium Monthly",
  },
  {
    id: "5",
    invoiceId: "INV-2025-0119",
    userName: "Priya Patel",
    userEmail: "priya.p@email.com",
    date: "2025-01-19 16:08",
    amount: 9.99,
    currency: "USD",
    status: "paid",
    planName: "Basic Monthly",
  },
  {
    id: "6",
    invoiceId: "INV-2025-0119-B",
    userName: "Luis Rodriguez",
    userEmail: "luis.r@email.com",
    date: "2025-01-19 11:33",
    amount: 24.99,
    currency: "USD",
    status: "pending",
    planName: "Premium Monthly",
  },
  {
    id: "7",
    invoiceId: "INV-2025-0118",
    userName: "Emma Thompson",
    userEmail: "emma.t@email.com",
    date: "2025-01-18 20:17",
    amount: 299.99,
    currency: "USD",
    status: "paid",
    planName: "Premium Annual",
  },
  {
    id: "8",
    invoiceId: "INV-2025-0118-B",
    userName: "Chen Wei",
    userEmail: "chen.w@email.com",
    date: "2025-01-18 08:55",
    amount: 24.99,
    currency: "USD",
    status: "failed",
    planName: "Premium Monthly",
  },
];

function getStatusBadge(status: Transaction["status"]) {
  const styles = {
    paid: "bg-success/20 text-success border-success/30",
    failed: "bg-destructive/20 text-destructive border-destructive/30",
    refunded: "bg-warning/20 text-warning border-warning/30",
    pending: "bg-accent/20 text-accent border-accent/30",
  };
  const labels = {
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
    pending: "Pending",
  };
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}

interface TransactionLedgerProps {
  searchQuery: string;
  statusFilter: string;
  page: number;
  pageSize: number;
}

export function TransactionLedger({
  searchQuery,
  statusFilter,
  page: _page,
  pageSize: _pageSize,
}: TransactionLedgerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateQuery("q", localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery]);

  // Sync local search with query changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const updateQuery = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // Reset pagination
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((tx) => {
      const matchesSearch =
        tx.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Calculate stats
  const grossVolume = mockTransactions
    .filter((tx) => tx.status === "paid")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const refundedAmount = mockTransactions
    .filter((tx) => tx.status === "refunded")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const netRevenue = grossVolume - refundedAmount;
  const refundRate = grossVolume > 0 ? ((refundedAmount / grossVolume) * 100).toFixed(1) : "0.0";

  const columns: Column<Transaction>[] = [
    {
      header: "Invoice ID",
      accessorKey: "invoiceId",
      className: "font-mono text-sm text-foreground",
    },
    {
      header: "User",
      cell: (tx) => (
        <div>
          <p className="text-foreground text-sm font-medium">{tx.userName}</p>
          <p className="text-muted-foreground text-xs">{tx.userEmail}</p>
        </div>
      ),
    },
    {
      header: "Plan",
      accessorKey: "planName",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "Date",
      accessorKey: "date",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "Amount",
      headerClassName: "text-right",
      className: "text-right font-medium text-foreground text-sm",
      cell: (tx) => `${tx.currency} $${tx.amount.toFixed(2)}`,
    },
    {
      header: "Status",
      cell: (tx) => getStatusBadge(tx.status),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Gross Volume</p>
                <p className="text-foreground text-2xl font-bold">${grossVolume.toFixed(2)}</p>
              </div>
              <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <DollarSign className="text-primary h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Net Revenue</p>
                <p className="text-foreground text-2xl font-bold">${netRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-success/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <TrendingUp className="text-success h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Refund Rate</p>
                <p className="text-foreground text-2xl font-bold">{refundRate}%</p>
              </div>
              <div className="bg-warning/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <RefreshCcw className="text-warning h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Failed Payments</p>
                <p className="text-foreground text-2xl font-bold">
                  {mockTransactions.filter((tx) => tx.status === "failed").length}
                </p>
              </div>
              <div className="bg-destructive/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by invoice, name, or email..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="bg-background/50 pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => updateQuery("status", v)}>
          <SelectTrigger className="bg-background/50 w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={statusFilter === "failed" ? "default" : "outline"}
          size="sm"
          onClick={() => updateQuery("status", statusFilter === "failed" ? "all" : "failed")}
          className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Failed Payments
        </Button>
        <Button
          variant={statusFilter === "refunded" ? "default" : "outline"}
          size="sm"
          onClick={() => updateQuery("status", statusFilter === "refunded" ? "all" : "refunded")}
          className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refunded
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        rowIdKey="id"
        emptyState={
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No transactions found matching your filters.</p>
          </div>
        }
        className="bg-card/50 border-border/50 rounded-lg border"
      />
    </div>
  );
}
