import type { DataTableClassNames } from "@/components/custom/data-table";

/**
 * `DataTable` overrides that keep the content module's tables on the base shadcn table look
 * (muted header, default row borders and padding) instead of the card-coloured default.
 */
export const CONTENT_TABLE_CLASS_NAMES: DataTableClassNames = {
  header: "bg-muted/30",
  headerRow: "border-border hover:bg-muted/50",
  head: "text-foreground bg-transparent",
  row: "border-border hover:bg-muted/50",
  cell: "p-2",
  empty: "text-muted-foreground h-auto py-8",
};
