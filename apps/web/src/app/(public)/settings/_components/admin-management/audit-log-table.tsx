"use client";

import { Badge } from "@/components/ui/badge";

import { type Column, DataTable } from "@/components/custom/data-table";

import { type AuditLog } from "./types";

interface AuditLogTableProps {
  logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const columns: Column<AuditLog>[] = [
    {
      header: "Actor",
      accessorKey: "actor",
      className: "text-sm font-medium text-foreground",
    },
    {
      header: "Action",
      cell: (log) => (
        <Badge
          variant="outline"
          className={
            log.action === "Deleted"
              ? "bg-destructive/20 border-destructive/30 text-destructive"
              : log.action === "Created"
                ? "bg-success/20 border-success/30 text-success"
                : "bg-primary/20 border-primary/30 text-primary"
          }>
          {log.action}
        </Badge>
      ),
    },
    {
      header: "Target",
      accessorKey: "target",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      className: "text-sm text-muted-foreground",
    },
    {
      header: "IP Address",
      accessorKey: "ip",
      className: "text-sm text-muted-foreground font-mono",
    },
  ];

  return <DataTable columns={columns} data={logs} rowIdKey="id" className="rounded-lg border" />;
}
