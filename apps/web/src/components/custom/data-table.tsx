"use client";

import * as React from "react";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/app/_libs/utils/cn";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { TablePagination, type TablePaginationProps } from "@/components/custom/table-pagination";

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

/** Per-part class overrides, merged after the defaults — for tables that keep a screen-specific look. */
export interface DataTableClassNames {
  /** The table surface (defaults to `bg-card`); applies with or without pagination. */
  container?: string;
  table?: string;
  header?: string;
  headerRow?: string;
  head?: string;
  row?: string;
  cell?: string;
  empty?: string;
}

/**
 * The listing look (content licensing, ads): transparent surface, muted-tinted header and
 * default row borders instead of the card-coloured default. Add `container: "bg-transparent"`
 * for the see-through surface the licensing table has.
 */
export const LISTING_TABLE_CLASS_NAMES: DataTableClassNames = {
  // The sticky header cells are opaque — the muted tint mixed into the card colour — so rows
  // scrolling underneath don't show through.
  header: "bg-card",
  headerRow: "border-border hover:bg-muted/50",
  head: "text-foreground bg-[color-mix(in_oklab,var(--color-muted)_30%,var(--color-card))]",
  row: "border-border hover:bg-muted/50",
  cell: "p-2",
  empty: "text-muted-foreground h-auto py-8",
};

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
  /** First load: skeleton rows instead of the empty state. */
  isLoading?: boolean;
  /** Number of skeleton rows while loading. Defaults to 5. */
  loadingRows?: number;
  /** The request failed: a retry state instead of the rows. */
  isError?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  pagination?: TablePaginationProps;
  infiniteScrollRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
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
  isLoading = false,
  loadingRows = 5,
  isError = false,
  onRetry,
  isRetrying,
  pagination,
  infiniteScrollRef,
  isFetchingNextPage = false,
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
    <div
      className={cn(
        "bg-card flex min-h-0 flex-col overflow-hidden",
        !pagination && className,
        classNames?.container,
      )}>
      <Table className={classNames?.table} containerClassName="min-h-0 flex-1 overflow-auto">
        <TableHeader className={cn("bg-card sticky top-0 z-10", classNames?.header)}>
          <TableRow className={cn("border-border/50 hover:bg-transparent", classNames?.headerRow)}>
            {selectable && (
              <TableHead className="bg-card sticky top-0 z-10 w-[50px] p-4">
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
          {isLoading ? (
            Array.from({ length: loadingRows }, (_, row) => (
              <TableRow key={row} className="border-border/30 hover:bg-transparent">
                {Array.from({ length: colSpan }, (_, col) => (
                  <TableCell key={col} className={cn("p-3", classNames?.cell)}>
                    <Skeleton className="bg-muted h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError && onRetry ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="p-0">
                <CustomRetryState onRetry={onRetry} isRetrying={isRetrying} />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
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
          {infiniteScrollRef && data.length > 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="p-0">
                <div ref={infiniteScrollRef} className="flex min-h-4 items-center justify-center">
                  {isFetchingNextPage && (
                    <AiOutlineLoading3Quarters
                      className="text-muted-foreground my-3 size-5 animate-spin"
                      aria-label="Loading more"
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (!pagination) return table;

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden", className)}>
      {table}
      <TablePagination {...pagination} />
    </div>
  );
}
