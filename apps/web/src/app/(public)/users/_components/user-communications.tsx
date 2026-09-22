"use client";

import { useMemo, useState } from "react";

import {
  Bell,
  CheckCircle2,
  Clock,
  Link2,
  Mail,
  Send,
  Sparkles,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/app/_libs/utils/cn";

type Channel = "push" | "email";

const CHANNELS: { key: Channel; label: string; icon: typeof Bell; hint: string }[] = [
  { key: "push", label: "Push", icon: Bell, hint: "Device notification" },
  { key: "email", label: "Email", icon: Mail, hint: "Inbox, richer body" },
];

/** Audience segments mirror the ones admins already filter the directory by. */
const AUDIENCES: { key: string; label: string; reach: number }[] = [
  { key: "all", label: "All users", reach: 248500 },
  { key: "subscribed", label: "Subscribed users", reach: 8923 },
  { key: "free", label: "Free users", reach: 239577 },
  { key: "dormant", label: "Dormant (14+ days inactive)", reach: 50500 },
  { key: "churn", label: "Churn risk — high value", reach: 1200 },
  { key: "power", label: "Power gamers", reach: 312 },
];

/** Starting points so an admin never faces an empty composer. */
const TEMPLATES: { key: string; label: string; title: string; body: string }[] = [
  {
    key: "winback",
    label: "Win-back",
    title: "We saved your streak 🔥",
    body: "You have been away a while. Come back today and pick your watch streak up where you left it.",
  },
  {
    key: "newdrop",
    label: "New content drop",
    title: "New episode just dropped",
    body: "The new episode is live now. Watch it before tonight's prediction game closes.",
  },
  {
    key: "bidding",
    label: "Bidding closing",
    title: "Bidding closes in 24 hours",
    body: "Your points could win the VIP Premiere Night experience. Place your bid before the auction closes.",
  },
];

const SENT: {
  title: string;
  audience: string;
  channel: Channel;
  sentAt: string;
  reach: number;
  openRate: number;
}[] = [
  {
    title: "Weekly quest reset is live",
    audience: "All users",
    channel: "push",
    sentAt: "2 days ago",
    reach: 248500,
    openRate: 31,
  },
  {
    title: "Your subscription renews soon",
    audience: "Subscribed users",
    channel: "email",
    sentAt: "5 days ago",
    reach: 8923,
    openRate: 58,
  },
  {
    title: "We miss you — 500 bonus points",
    audience: "Dormant (14+ days inactive)",
    channel: "push",
    sentAt: "1 week ago",
    reach: 50500,
    openRate: 19,
  },
];

const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
      ? `${(n / 1000).toFixed(1)}K`
      : `${n}`;

interface UserCommunicationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Communication to Users — compose a push or email and send it to a user segment.
 * Lives in a modal rather than on the page: it is an occasional task, and inline it
 * pushed the analytics the page is actually for below the fold.
 */
export function UserCommunicationsModal({ open, onOpenChange }: UserCommunicationsModalProps) {
  const [channel, setChannel] = useState<Channel>("push");
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [schedule, setSchedule] = useState("");

  const reach = useMemo(() => AUDIENCES.find((a) => a.key === audience)?.reach ?? 0, [audience]);
  const audienceLabel = AUDIENCES.find((a) => a.key === audience)?.label ?? "";
  const canSend = title.trim().length > 0 && message.trim().length > 0;

  const applyTemplate = (key: string) => {
    const t = TEMPLATES.find((x) => x.key === key);
    if (!t) return;
    setTitle(t.title);
    setMessage(t.body);
  };

  const send = () => {
    toast.success(
      schedule
        ? `Scheduled for ${schedule} — ${audienceLabel} (${compact(reach)} users)`
        : `Sent to ${audienceLabel} — ${compact(reach)} users`,
    );
    setTitle("");
    setMessage("");
    setDeepLink("");
    setSchedule("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-h-[88vh] w-full max-w-2xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="text-accent h-4 w-4" /> Communication to Users
          </DialogTitle>
          <DialogDescription>
            Compose a push or email and send it to a user segment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel */}
          <div className="grid grid-cols-2 gap-2">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              const active = channel === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setChannel(c.key)}
                  aria-pressed={active}
                  className={cn(
                    "border-border hover:border-primary/50 cursor-pointer rounded-lg border p-3 text-left transition-all",
                    active && "border-primary bg-primary/5",
                  )}>
                  <Icon
                    className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")}
                  />
                  <p className="text-foreground mt-1.5 text-sm font-medium">{c.label}</p>
                  <p className="text-muted-foreground text-xs">{c.hint}</p>
                </button>
              );
            })}
          </div>

          {/* Audience + schedule */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="w-full gap-1.5">
                  <UsersIcon className="text-muted-foreground h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card z-50">
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a.key} value={a.key}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Send</Label>
              <div className="relative">
                <Clock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <Input
                  type="datetime-local"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-muted-foreground text-xs">Leave empty to send immediately.</p>
            </div>
          </div>

          {/* Templates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" /> Start from
            </span>
            {TEMPLATES.map((t) => (
              <Button
                key={t.key}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 cursor-pointer px-2 text-xs"
                onClick={() => applyTemplate(t.key)}>
                {t.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="comm-title">Title</Label>
            <Input
              id="comm-title"
              value={title}
              maxLength={60}
              placeholder="Short and specific — this is the line they read"
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-muted-foreground text-right text-xs tabular-nums">
              {title.length}/60
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comm-body">Message</Label>
            <Textarea
              id="comm-body"
              value={message}
              maxLength={240}
              rows={3}
              placeholder="What do you want them to do, and why now?"
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-muted-foreground text-right text-xs tabular-nums">
              {message.length}/240
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comm-link">Deep link (optional)</Label>
            <div className="relative">
              <Link2 className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                id="comm-link"
                value={deepLink}
                placeholder="app://content/1284"
                onChange={(e) => setDeepLink(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Recently sent — what went out, and how it landed */}
          <div className="border-border/50 space-y-2 border-t pt-3">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Recently sent
            </p>
            {SENT.map((s) => (
              <div key={s.title} className="border-border/40 rounded-lg border p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground text-sm font-medium">{s.title}</p>
                  <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                    {s.channel}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {s.audience} · {compact(s.reach)} users · {s.sentAt}
                </p>
                <p className="text-success mt-1 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> {s.openRate}% opened
                </p>
              </div>
            ))}
          </div>

          <div className="border-border/50 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <p className="text-muted-foreground text-sm">
              Reaching{" "}
              <span className="text-foreground font-semibold tabular-nums">{compact(reach)}</span>{" "}
              users · {audienceLabel}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer gap-2" disabled={!canSend} onClick={send}>
                <Send className="h-4 w-4" />
                {schedule ? "Schedule" : "Send now"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
