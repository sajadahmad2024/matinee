"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
}

export function TaxonomyManager({ title, noun, initialItems, metaLabel, showCount = true }: TaxonomyManagerProps) {
  const [items, setItems] = useState<TaxonomyItem[]>(initialItems);
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<TaxonomyItem | null>(null);
  const [name, setName] = useState("");
  const [meta, setMeta] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setMeta("");
    setModalOpen(true);
  };
  const openEdit = (item: TaxonomyItem) => {
    setEditing(item);
    setName(item.name);
    setMeta(item.meta ?? "");
    setModalOpen(true);
  };

  const save = () => {
    if (!name.trim()) return;
    if (editing) {
      setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, name: name.trim(), meta: meta.trim() || undefined } : i)));
      toast.success(`${noun} updated`);
    } else {
      setItems((prev) => [
        { id: `${noun.toLowerCase()}_${Date.now()}`, name: name.trim(), meta: meta.trim() || undefined, count: 0 },
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

      <div className="border-border/40 border-t">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Name</TableHead>
              {metaLabel && <TableHead>{metaLabel}</TableHead>}
              {showCount && <TableHead className="text-right">Used by</TableHead>}
              <TableHead className="w-[90px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                  No {title.toLowerCase()} yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="border-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${noun}` : `Add ${noun}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
