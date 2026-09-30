"use client";

import { useEffect, useState } from "react";

import { Check, Copy, Eye, FileText, History, Pencil, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { richTextClipboardContent } from "@/app/(public)/_libs/utils/rich-text-clipboard";
import { cn } from "@/app/_libs/utils/cn";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import { RichTextEditor, RichTextView, STATIC_PAGE_EXTENSIONS, docText } from "./rich-text-editor";
import {
  INITIAL_PAGES,
  type PageStatus,
  type StaticPageContent,
  type StaticPageVersion,
  livePath,
  nextVersionLabel,
  pageStatus,
  sameContent,
} from "./static-pages-data";

const TITLE_MAX = 120;

const STATUS_BADGE: Record<PageStatus, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-success/15 border-success/30 text-success" },
  unpublished: { label: "Not published", className: "bg-muted text-muted-foreground" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Fields that block publishing. */
function publishErrors(content: StaticPageContent) {
  return {
    title: !content.title.trim(),
    doc: !docText(content.doc).trim(),
  };
}

function CopyContentButton({ content }: { content: StaticPageContent }) {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    if (
      await copy(
        richTextClipboardContent({
          doc: content.doc,
          extensions: STATIC_PAGE_EXTENSIONS,
          title: content.title,
        }),
      )
    )
      toast.success("Content copied");
    else toast.error("Couldn't copy the content. Check your browser's clipboard permission.");
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="shrink-0 cursor-pointer gap-1.5"
      onClick={handleCopy}
      aria-label="Copy this version's content">
      {copied ? <Check className="text-success h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

/** `scrollable`: the bordered box keeps its size and only the text inside it scrolls. */
function PagePreview({
  content,
  scrollable = false,
}: {
  content: StaticPageContent;
  scrollable?: boolean;
}) {
  return (
    <article
      className={cn(
        "border-border/50 bg-background/50 rounded-lg border",
        scrollable && "flex min-h-0 flex-col overflow-hidden",
      )}>
      <div className={cn("p-6", scrollable && "min-h-0 flex-1 overflow-y-auto")}>
        <h1 className="text-foreground text-2xl font-bold">{content.title || "Untitled page"}</h1>
        <RichTextView doc={content.doc} className="mt-5" />
      </div>
    </article>
  );
}

export function StaticPagesSettings() {
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [selectedSlug, setSelectedSlug] = useState(INITIAL_PAGES[0].slug);
  const [form, setForm] = useState<StaticPageContent>(INITIAL_PAGES[0].content);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [showErrors, setShowErrors] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [viewVersion, setViewVersion] = useState<StaticPageVersion | null>(null);

  const page = pages.find((p) => p.slug === selectedSlug)!;
  const live = page.versions[0];
  const isDirty = !sameContent(form, page.content);
  const errors = publishErrors(form);
  const status = pageStatus(page);

  // warn before closing/reloading the browser tab with unsaved edits
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const openPage = (slug: string) => {
    const next = pages.find((p) => p.slug === slug)!;
    setSelectedSlug(slug);
    setForm(next.content);
    setMode("edit");
    setShowErrors(false);
    setPendingSlug(null);
  };

  const selectPage = (slug: string) => {
    if (slug === selectedSlug) return;
    if (isDirty) setPendingSlug(slug);
    else openPage(slug);
  };

  const setField = <K extends keyof StaticPageContent>(key: K, value: StaticPageContent[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handlePublishClick = () => {
    if (errors.title || errors.doc) {
      setShowErrors(true);
      setMode("edit");
      toast.error(
        errors.title ? "Add a page title before publishing" : "Add some content before publishing",
      );
      return;
    }
    setConfirmPublish(true);
  };

  const handlePublish = () => {
    const now = new Date();
    const version: StaticPageVersion = {
      ...form,
      id: `v${now.getTime().toString(36)}`,
      label: nextVersionLabel(page, now),
      publishedAt: now.toISOString(),
      publishedBy: "Sajad Ahmad",
    };
    setPages((prev) =>
      prev.map((p) =>
        p.slug === selectedSlug ? { ...p, content: form, versions: [version, ...p.versions] } : p,
      ),
    );
    setConfirmPublish(false);
    setShowErrors(false);
    toast.success(`${form.title} published`, { description: `Version ${version.label}` });
  };

  const errorRing = "border-destructive focus-visible:ring-destructive/40";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      {/* Page list */}
      <Card className="border-border bg-card h-fit py-2">
        <CardHeader className="px-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="text-primary h-4 w-4" /> Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-2 pt-0">
          {pages.map((p) => {
            const s = STATUS_BADGE[pageStatus(p)];
            return (
              <button
                key={p.slug}
                onClick={() => selectPage(p.slug)}
                className={cn(
                  "hover:bg-accent w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors",
                  p.slug === selectedSlug && "bg-primary/10 ring-primary/30 ring-1",
                )}>
                <div className="text-foreground text-sm font-medium">
                  {p.content.title || p.slug}
                </div>
                <Badge variant="outline" className={cn("mt-1 text-[10px]", s.className)}>
                  {s.label}
                </Badge>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-6">
        {/* Editor */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                {page.content.title || page.slug}
                <Badge variant="outline" className={STATUS_BADGE[status].className}>
                  {STATUS_BADGE[status].label}
                </Badge>
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-1.5">
                <span className="font-mono">{livePath(page.slug)}</span>
                <span>
                  ·{" "}
                  {live
                    ? `Last published ${formatDate(live.publishedAt)} by ${live.publishedBy} · Version ${live.label}`
                    : "Not published yet — users can't see this page"}
                </span>
              </CardDescription>
            </div>
            <div className="border-border/50 bg-background/50 flex shrink-0 rounded-lg border p-1">
              <Button
                size="sm"
                variant={mode === "edit" ? "default" : "ghost"}
                onClick={() => setMode("edit")}
                className="cursor-pointer gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant={mode === "preview" ? "default" : "ghost"}
                onClick={() => setMode("preview")}
                className="cursor-pointer gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {mode === "preview" ? (
              <PagePreview content={form} />
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="page-title">Page title</Label>
                  <Input
                    id="page-title"
                    value={form.title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => setField("title", e.target.value)}
                    className={cn("bg-background/50", showErrors && errors.title && errorRing)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="page-content">Content</Label>
                  <RichTextEditor
                    id="page-content"
                    value={form.doc}
                    onChange={(doc) => setField("doc", doc)}
                    placeholder="Write the page content. Use headings to split it into sections."
                    invalid={showErrors && errors.doc}
                  />
                </div>
              </>
            )}

            {/* Footer actions */}
            <div className="border-border/50 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className={cn("text-xs", isDirty ? "text-warning" : "text-muted-foreground")}>
                {isDirty ? "● Unpublished changes" : "No changes"}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  disabled={!isDirty}
                  onClick={() => {
                    setForm(page.content);
                    setShowErrors(false);
                  }}
                  className="cursor-pointer gap-2">
                  <RotateCcw className="h-4 w-4" /> Discard
                </Button>
                <Button
                  onClick={handlePublishClick}
                  disabled={!isDirty && !!live}
                  className="cursor-pointer gap-2">
                  <Send className="h-4 w-4" /> Publish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version history */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="text-primary h-4 w-4" /> Published versions
            </CardTitle>
            <CardDescription>
              Each publish is kept. Users who accept this page are recorded against the version they
              saw.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {page.versions.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Not published yet. Users can&apos;t see this page until you publish it.
              </p>
            ) : (
              <ul className="divide-border/50 divide-y">
                {page.versions.map((v, i) => (
                  <li
                    key={v.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-mono text-sm">{v.label}</span>
                        {i === 0 && (
                          <Badge
                            variant="outline"
                            className="bg-success/15 border-success/30 text-success text-[10px]">
                            Live
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Published {formatDate(v.publishedAt)} by {v.publishedBy}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 cursor-pointer gap-1.5"
                      onClick={() => setViewVersion(v)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={viewVersion !== null} onOpenChange={(open) => !open && setViewVersion(null)}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-3xl">
          {viewVersion && (
            <>
              <div className="flex shrink-0 items-start justify-between gap-3 pr-8">
                <DialogHeader>
                  <DialogTitle className="font-mono text-base">{viewVersion.label}</DialogTitle>
                  <DialogDescription>
                    Published {formatDate(viewVersion.publishedAt)} by {viewVersion.publishedBy}
                  </DialogDescription>
                </DialogHeader>
                <CopyContentButton content={viewVersion} />
              </div>
              <PagePreview content={viewVersion} scrollable />
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title={`Publish ${form.title}?`}
        description={`This publishes version ${nextVersionLabel(page)} for all users on web and app.`}
        action="custom"
        confirmLabel="Publish"
        destructive={false}
        onConfirm={handlePublish}
      />

      <ConfirmationDialog
        open={pendingSlug !== null}
        onOpenChange={(open) => !open && setPendingSlug(null)}
        title="Discard unsaved changes?"
        description={`Your changes to ${page.content.title || page.slug} haven't been published.`}
        action="custom"
        confirmLabel="Discard changes"
        onConfirm={() => pendingSlug && openPage(pendingSlug)}
      />
    </div>
  );
}
