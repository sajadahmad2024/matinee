"use client";

import { useState } from "react";

import { Bell, Copy, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/app/_libs/utils/cn";

type Status = "draft" | "scheduled" | "sent" | "sending" | "canceled";

interface Campaign {
  id: string;
  title: string;
  target: string;
  status: Status;
  when: string;
  recipients: number;
  delivered: number;
  opened: number;
}

const STATUS_TONE: Record<Status, string> = {
  sent: "bg-success/15 text-success",
  scheduled: "bg-amber-500/15 text-amber-500",
  sending: "bg-primary/15 text-primary",
  draft: "bg-muted text-muted-foreground",
  canceled: "bg-destructive/15 text-destructive",
};

const INITIAL: Campaign[] = [
  { id: "1", title: "New mini-games are live!", target: "All users", status: "sent", when: "May 28", recipients: 198000, delivered: 191400, opened: 88200 },
  { id: "2", title: "Your streak is about to break 🔥", target: "Segment: active streak", status: "sent", when: "May 30", recipients: 42000, delivered: 41100, opened: 26800 },
  { id: "3", title: "Weekend quest drop", target: "All users", status: "scheduled", when: "Jun 14, 6 PM", recipients: 0, delivered: 0, opened: 0 },
  { id: "4", title: "Win VIP premiere passes", target: "Segment: subscribers", status: "draft", when: "—", recipients: 0, delivered: 0, opened: 0 },
];

export function NotificationCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [target, setTarget] = useState("all");
  const [sendType, setSendType] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");

  const cancel = (c: Campaign) => {
    setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "canceled" } : x)));
    toast.success(`Canceled "${c.title}"`);
  };
  const duplicate = (c: Campaign) => {
    setCampaigns((prev) => [{ ...c, id: `${Date.now()}`, title: `${c.title} (copy)`, status: "draft", when: "—", recipients: 0, delivered: 0, opened: 0 }, ...prev]);
    toast.success("Duplicated as draft");
  };
  const create = () => {
    setCampaigns((prev) => [
      {
        id: `${Date.now()}`,
        title: title || "Untitled",
        target: target === "all" ? "All users" : "Segment",
        status: sendType === "now" ? "sending" : "scheduled",
        when: sendType === "now" ? "now" : scheduleDate,
        recipients: 0,
        delivered: 0,
        opened: 0,
      },
      ...prev,
    ]);
    toast.success(sendType === "now" ? "Campaign sending" : "Campaign scheduled");
    setOpen(false);
    setTitle("");
    setMessage("");
    setDeepLink("");
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="text-primary h-4 w-4" /> Notification campaigns
            </CardTitle>
            <CardDescription>Push history, scheduled sends and delivery stats.</CardDescription>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-border/40 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>When</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Open rate</TableHead>
                <TableHead className="w-[90px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-foreground max-w-[220px] truncate text-sm font-medium">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{c.target}</TableCell>
                  <TableCell>
                    <Badge className={cn("border-0 text-[10px] capitalize", STATUS_TONE[c.status])}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.when}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {c.delivered ? c.delivered.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {c.delivered ? `${Math.round((c.opened / c.delivered) * 100)}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicate" onClick={() => duplicate(c)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      {c.status === "scheduled" && (
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" title="Cancel" onClick={() => cancel(c)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>New campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification body" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Deep link (optional)</Label>
              <Input value={deepLink} onChange={(e) => setDeepLink(e.target.value)} placeholder="matinee://content/123" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="segment">Segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Send</Label>
                <Select value={sendType} onValueChange={setSendType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="now">Now</SelectItem>
                    <SelectItem value="scheduled">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {sendType === "scheduled" && (
              <div className="space-y-2">
                <Label>Schedule for</Label>
                <Input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={!title.trim()}>{sendType === "now" ? "Send" : "Schedule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
