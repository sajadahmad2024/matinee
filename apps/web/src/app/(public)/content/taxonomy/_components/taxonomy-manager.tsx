"use client";

import { useRef, useState } from "react";

import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomSearch } from "@/components/custom/custom-search";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { type Column, DataTable } from "@/components/custom/data-table";
import { GlassCard } from "@/components/custom/glass-card";

import { CONTENT_TABLE_CLASS_NAMES } from "../../_components/content-table-class-names";

export interface TaxonomyItem {
  id: string;
  name: string;
  meta?: string; // description / role
  count?: number; // content using it
  image?: string; // logo / photo (media url)
}

type SortValue = "most" | "least" | "name";

const SORT_OPTIONS: CustomSelectOption<SortValue>[] = [
  { value: "most", label: "Most used" },
  { value: "least", label: "Least used" },
  { value: "name", label: "Name (A–Z)" },
];

const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

interface TaxonomyManagerProps {
  title: string;
  /** singular noun used in buttons/labels, e.g. "Studio" */
  noun: string;
  initialItems: TaxonomyItem[];
  /** column header + field label for the optional meta field; omit to hide it */
  metaLabel?: string;
  /** show a "Used by" count column */
  showCount?: boolean;
  /** label for the image (e.g. "Logo" / "Photo"); enables the image column + uploader */
  imageLabel?: string;
}

export function TaxonomyManager({
  title,
  noun,
  initialItems,
  metaLabel,
  showCount = true,
  imageLabel,
}: TaxonomyManagerProps) {
  const [items, setItems] = useState<TaxonomyItem[]>(initialItems);
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<TaxonomyItem | null>(null);
  const [name, setName] = useState("");
  const [meta, setMeta] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Search + sort (scales as the taxonomy library grows) + contextual insights.
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("most");
  const q = query.trim().toLowerCase();
  const visible = items
    .filter(
      (i) => !q || i.name.toLowerCase().includes(q) || (i.meta ?? "").toLowerCase().includes(q),
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const ac = a.count ?? 0;
      const bc = b.count ?? 0;
      return sort === "most" ? bc - ac : ac - bc;
    });
  const mostUsed = items.reduce<TaxonomyItem | null>(
    (m, i) => ((i.count ?? 0) > (m?.count ?? -1) ? i : m),
    null,
  );
  const unusedCount = items.filter((i) => (i.count ?? 0) === 0).length;

  const openCreate = () => {
    setEditing(null);
    setName("");
    setMeta("");
    setImage(null);
    setModalOpen(true);
  };
  const openEdit = (item: TaxonomyItem) => {
    setEditing(item);
    setName(item.name);
    setMeta(item.meta ?? "");
    setImage(item.image ?? null);
    setModalOpen(true);
  };

  const pickImage = (file?: File) => {
    if (file) setImage(URL.createObjectURL(file));
  };

  const save = () => {
    if (!name.trim()) return;
    const patch = { name: name.trim(), meta: meta.trim() || undefined, image: image ?? undefined };
    if (editing) {
      setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...patch } : i)));
      toast.success(`${noun} updated`);
    } else {
      setItems((prev) => [
        { id: `${noun.toLowerCase()}_${Date.now()}`, count: 0, ...patch },
        ...prev,
      ]);
      toast.success(`${noun} created`);
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setItems((prev) => prev.filter((i) => i.id !== deleting.id));
    toast.success(`${noun} "${deleting.name}" deleted`);
    setDeleting(null);
  };

  const columns: Column<TaxonomyItem>[] = [
    ...(imageLabel
      ? [
          {
            header: imageLabel,
            headerClassName: "w-[60px]",
            cell: (item: TaxonomyItem) => (
              <Avatar className="h-9 w-9 rounded-md">
                <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                <AvatarFallback className="bg-primary/15 text-primary rounded-md text-xs">
                  {initials(item.name)}
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
            cell: (item: TaxonomyItem) => item.meta ?? "—",
            className: "text-muted-foreground text-sm",
          },
        ]
      : []),
    ...(showCount
      ? [
          {
            header: "Used by",
            headerClassName: "text-right",
            cell: (item: TaxonomyItem) => (item.count ?? 0).toLocaleString(),
            className: "text-muted-foreground text-right text-sm tabular-nums",
          },
        ]
      : []),
    {
      header: "Actions",
      headerClassName: "w-[90px] text-right",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Edit ${item.name}`}
            onClick={() => openEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive h-8 w-8"
            aria-label={`Delete ${item.name}`}
            onClick={() => setDeleting(item)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <GlassCard className="p-0">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-foreground text-base font-semibold">{title}</h3>
          <p className="text-muted-foreground text-xs">
            {items.length} {title.toLowerCase()}
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add {noun}
        </Button>
      </div>

      {/* Search + sort controls — scale as the library grows */}
      <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CustomSearch
          onSearch={setQuery}
          debounceMs={0}
          placeholder={`Search ${title.toLowerCase()}...`}
          isClearable={false}
          containerClassName="w-full sm:max-w-xs"
          inputClassName="text-base md:text-sm"
        />
        <CustomSelect
          options={SORT_OPTIONS}
          value={sort}
          onValueChange={setSort}
          triggerClassName="w-[170px]"
          aria-label="Sort"
        />
      </div>

      <DataTable
        columns={columns}
        data={visible}
        rowIdKey="id"
        className="border-border/40 border-t bg-transparent"
        classNames={CONTENT_TABLE_CLASS_NAMES}
        emptyState={items.length === 0 ? `No ${title.toLowerCase()} yet.` : "No matches."}
      />

      {/* Contextual insights — fills the page with useful info instead of empty space */}
      <div className="border-border/40 grid grid-cols-3 gap-4 border-t p-4">
        <div>
          <p className="text-muted-foreground text-xs">Total</p>
          <p className="text-foreground font-semibold">{items.length}</p>
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">Most used</p>
          <p className="text-foreground truncate font-semibold">
            {mostUsed ? `${mostUsed.name} · ${(mostUsed.count ?? 0).toLocaleString()}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Unused (safe to remove)</p>
          <p className={`font-semibold ${unusedCount > 0 ? "text-warning" : "text-foreground"}`}>
            {unusedCount}
          </p>
        </div>
      </div>

      <CustomModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        appearance="default"
        className="border-border bg-card max-w-md"
        title={editing ? `Edit ${noun}` : `Add ${noun}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!name.trim()}>
              {editing ? "Save changes" : `Create ${noun}`}
            </Button>
          </>
        }>
        <div className="space-y-4">
          {imageLabel && (
            <CustomField label={imageLabel}>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 rounded-lg">
                  <AvatarImage src={image ?? undefined} alt="" className="object-cover" />
                  <AvatarFallback className="bg-primary/15 text-primary rounded-lg">
                    {name.trim() ? initials(name) : <ImagePlus className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickImage(e.target.files?.[0] ?? undefined)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}>
                  Upload
                </Button>
                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-1"
                    onClick={() => setImage(null)}>
                    <X className="h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
            </CustomField>
          )}
          <CustomField label={`${noun} name`} htmlFor="taxonomy-name">
            <Input
              id="taxonomy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${noun} name`}
              autoFocus
            />
          </CustomField>
          {metaLabel && (
            <CustomField label={metaLabel} htmlFor="taxonomy-meta">
              <Input
                id="taxonomy-meta"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder={metaLabel}
              />
            </CustomField>
          )}
        </div>
      </CustomModal>

      <ConfirmationDialog
        open={!!deleting}
        onOpenChange={() => setDeleting(null)}
        title={`Delete ${noun}`}
        description={
          <>
            Delete &quot;{deleting?.name}&quot;?
            {deleting && (deleting.count ?? 0) > 0 && (
              <p className="bg-destructive/10 text-destructive mt-3 rounded-lg border border-transparent p-3 text-sm">
                ⚠️ Used by {deleting.count} item(s). They will be untagged.
              </p>
            )}
          </>
        }
        onConfirm={confirmDelete}
        action="delete"
      />
    </GlassCard>
  );
}
