"use client";

import { useState } from "react";

import { Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SpendRow {
  id: string;
  channel: string;
  month: string;
  spend: number;
  newUsers: number;
}

const CHANNELS = ["organic", "paid_social", "referral", "influencer", "search", "other"];

const INITIAL: SpendRow[] = [
  { id: "1", channel: "paid_social", month: "2026-05", spend: 42000, newUsers: 1900 },
  { id: "2", channel: "influencer", month: "2026-05", spend: 18000, newUsers: 1000 },
  { id: "3", channel: "referral", month: "2026-05", spend: 4000, newUsers: 4400 },
  { id: "4", channel: "search", month: "2026-05", spend: 9000, newUsers: 1100 },
];

export function GrowthSettings() {
  const [rows, setRows] = useState<SpendRow[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState("paid_social");
  const [month, setMonth] = useState("");
  const [spend, setSpend] = useState(0);
  const [newUsers, setNewUsers] = useState(0);

  const add = () => {
    setRows((prev) => [{ id: `${Date.now()}`, channel, month, spend, newUsers }, ...prev]);
    toast.success("Marketing spend recorded");
    setOpen(false);
    setMonth("");
    setSpend(0);
    setNewUsers(0);
  };

  const cac = (r: SpendRow) => (r.newUsers > 0 ? r.spend / r.newUsers : 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="text-success h-4 w-4" /> Marketing spend &amp; CAC
            </CardTitle>
            <CardDescription>Spend per channel/month feeds CAC and LTV:CAC on the dashboard.</CardDescription>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add spend
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-border/40 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">New users</TableHead>
                <TableHead className="text-right">CAC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-foreground text-sm capitalize">{r.channel.replace("_", " ")}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.month}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">${r.spend.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{r.newUsers.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">${cac(r).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle>Add marketing spend</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    {CHANNELS.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Spend ($)</Label>
                <Input type="number" min={0} value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>New users acquired</Label>
                <Input type="number" min={0} value={newUsers} onChange={(e) => setNewUsers(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={add} disabled={!month}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
