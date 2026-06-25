"use client";

import { useRef, useState } from "react";

import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { GlassCard } from "../../../games/_components/glass-card";

export interface TaxonomyItem {
  id: string;
  name: string;
  meta?: string; // description / role
  count?: number; // content using it
  image?: string; // logo / photo (media url)
}

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

export function TaxonomyManager({ title, noun, initialItems, metaLabel, showCount = true, imageLabel }: TaxonomyManagerProps) {
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
  const [sort, setSort] = useState<"most" | "least" | "name">("most");
  const q = query.trim().toLowerCase();
  const visible = items
    .filter((i) => !q || i.name.toLowerCase().includes(q) || (i.meta ?? "").toLowerCase().includes(q))
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

  const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

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
      setItems((prev) => [{ id: `${noun.toLowerCase()}_${Date.now()}`, count: 0, ...patch }, ...prev]);
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

  return (
    <GlassCard className="p-0">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-foreground text-base font-semibold">{title}</h3>
          <p className="text-muted-foreground text-xs">{items.length} {title.toLowerCase()}</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add {noun}
        </Button>
      </div>

      {/* Search + sort controls — scale as the library grows */}
      <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card z-50">
            <SelectItem value="most">Most used</SelectItem>
            <SelectItem value="least">Least used</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-border/40 border-t">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {imageLabel && <TableHead className="w-[60px]">{imageLabel}</TableHead>}
              <TableHead>Name</TableHead>
              {metaLabel && <TableHead>{metaLabel}</TableHead>}
              {showCount && <TableHead className="text-right">Used by</TableHead>}
              <TableHead className="w-[90px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  {items.length === 0 ? `No ${title.toLowerCase()} yet.` : "No matches."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((item) => (
                <TableRow key={item.id}>
                  {imageLabel && (
                    <TableCell>
                      <Avatar className="h-9 w-9 rounded-md">
                        <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/15 text-primary rounded-md text-xs">
                          {initials(item.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                  )}
                  <TableCell className="text-foreground font-medium">{item.name}</TableCell>
                  {metaLabel && <TableCell className="text-muted-foreground text-sm">{item.meta ?? "—"}</TableCell>}
                  {showCount && (
                    <TableCell className="text-muted-foreground text-right text-sm tabular-nums">
                      {(item.count ?? 0).toLocaleString()}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => setDeleting(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="border-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${noun}` : `Add ${noun}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageLabel && (
              <div className="space-y-2">
                <Label>{imageLabel}</Label>
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
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    Upload
                  </Button>
                  {image && (
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground gap-1" onClick={() => setImage(null)}>
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>{noun} name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${noun} name`} autoFocus />
            </div>
            {metaLabel && (
              <div className="space-y-2">
                <Label>{metaLabel}</Label>
                <Input value={meta} onChange={(e) => setMeta(e.target.value)} placeholder={metaLabel} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!name.trim()}>{editing ? "Save changes" : `Create ${noun}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
