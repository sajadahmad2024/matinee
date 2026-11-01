import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { CustomActionsMenu } from "@/components/custom/custom-actions-menu";
import type { CustomSelectOption } from "@/components/custom/custom-select";
import type { Column } from "@/components/custom/data-table";
import { StatusBadge } from "@/components/custom/status-badge";

import {
  type TaxonomyImageGetter,
  type TaxonomyMetaGetter,
  type TaxonomyRow,
  initials,
  metaText,
} from "../../_shared/taxonomy-types";

interface TaxonomyColumnsOptions<T extends TaxonomyRow> {
  imageLabel?: string;
  getImageUrl?: TaxonomyImageGetter<T>;
  metaLabel?: string;
  getMeta?: TaxonomyMetaGetter<T>;
  metaOptions?: CustomSelectOption[];
  showCount: boolean;
  /** Enables the Status column + enable/disable action (genres). */
  isActive?: (row: T) => boolean;
  onToggleActive?: (row: T) => void;
  /** Row whose enable/disable request is in flight. */
  togglingId?: string | null;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

/** Image → Name → Meta → Used by → Actions; the optional columns follow the tab config. */
export function buildTaxonomyColumns<T extends TaxonomyRow>({
  imageLabel,
  getImageUrl,
  metaLabel,
  getMeta,
  metaOptions,
  showCount,
  isActive,
  onToggleActive,
  togglingId,
  onEdit,
  onDelete,
}: TaxonomyColumnsOptions<T>): Column<T>[] {
  return [
    ...(imageLabel
      ? [
          {
            header: imageLabel,
            cell: (row: T) => (
              <Avatar className="h-9 w-9 rounded-md">
                <AvatarImage
                  src={getImageUrl?.(row) ?? undefined}
                  alt=""
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/15 text-primary rounded-md text-xs">
                  {initials(row?.name ?? "")}
                </AvatarFallback>
              </Avatar>
            ),
          },
        ]
      : []),
    { header: "Name", accessorKey: "name", className: "text-foreground font-medium" },
    ...(metaLabel
      ? [
          {
            header: metaLabel,
            cell: (row: T) => metaText(getMeta?.(row), metaOptions) ?? "—",
            className: "text-muted-foreground text-sm",
          },
        ]
      : []),
    ...(showCount
      ? [
          {
            header: "Used by",
            cell: (row: T) => (row?.contentCount ?? 0).toLocaleString(),
            className: "text-muted-foreground text-sm tabular-nums",
          },
        ]
      : []),
    ...(isActive
      ? [
          {
            header: "Status",
            cell: (row: T) => <StatusBadge status={isActive(row) ? "active" : "inactive"} />,
          },
        ]
      : []),
    {
      header: "Actions",
      cell: (row) => (
        <CustomActionsMenu
          label={`Actions for ${row?.name}`}
          isLoading={togglingId === row?.id}
          actions={[
            { label: "Edit", icon: Pencil, onClick: () => onEdit(row) },
            {
              label: "Disable",
              icon: EyeOff,
              onClick: () => onToggleActive?.(row),
              hidden: !onToggleActive || !isActive?.(row),
            },
            {
              label: "Enable",
              icon: Eye,
              tone: "success",
              onClick: () => onToggleActive?.(row),
              hidden: !onToggleActive || !isActive || isActive(row),
            },
            {
              label: "Delete",
              icon: Trash2,
              tone: "destructive",
              separatorBefore: true,
              onClick: () => onDelete(row),
            },
          ]}
        />
      ),
    },
  ];
}
