"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/app/_libs/utils/cn";

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

/** Per-part class overrides, merged after the defaults — for tables that keep a screen-specific look. */
export interface DataTableClassNames {
  header?: string;
  headerRow?: string;
  head?: string;
  row?: string;
  cell?: string;
  empty?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowIdKey: keyof T;
  onRowClick?: (item: T) => void;
  className?: string;
  classNames?: DataTableClassNames;
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  // Empty State
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  rowIdKey,
  onRowClick,
  className,
  classNames,
  selectable,
  selectedIds = [],
  onSelectionChange,
  emptyState,
}: DataTableProps<T>) {
  const allIds = React.useMemo(() => data.map((item) => String(item[rowIdKey])), [data, rowIdKey]);
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? allIds : []);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      }
    }
  };

  const colSpan = columns.length + (selectable ? 1 : 0);

  // The inner container is the scroller (both axes), so the sticky header pins to it; a height
  // limit on `className` (e.g. `max-h-[560px]`) passes down through the flex column. The outer box
  // only clips (`overflow-hidden`), so the header follows rounded corners passed in `className`.
  const table = (
    <div className={cn("bg-card flex min-h-0 flex-col overflow-hidden", !pagination && className)}>
      <Table containerClassName="min-h-0 flex-1 overflow-auto">
        <TableHeader className={cn("bg-card sticky top-0 z-10", classNames?.header)}>
          <TableRow className={cn("border-border/50 hover:bg-transparent", classNames?.headerRow)}>
            {selectable && (
              <TableHead className="w-[50px] p-4">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-primary cursor-pointer rounded-full"
                />
              </TableHead>
            )}
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  "text-muted-foreground bg-card sticky top-0 z-10",
                  classNames?.head,
                  column.headerClassName,
                )}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className={cn("h-24 text-center", classNames?.empty)}>
                {emptyState || <span className="text-muted-foreground">No results found.</span>}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const id = String(item[rowIdKey]);
              const isSelected = selectedIds.includes(id);

              return (
                <TableRow
                  key={id}
                  className={cn(
                    "border-border/30 hover:bg-muted/20 transition-colors",
                    onRowClick && "cursor-pointer",
                    isSelected && "bg-accent/5",
                    classNames?.row,
                  )}
                  onClick={() => onRowClick?.(item)}>
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()} className="p-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(id, !!checked)}
                        className="border-primary cursor-pointer rounded-full"
                      />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={cn("p-3", classNames?.cell, column.className)}>
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                          ? (item[column.accessorKey] as React.ReactNode)
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
