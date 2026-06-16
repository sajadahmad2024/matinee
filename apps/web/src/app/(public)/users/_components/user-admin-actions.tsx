"use client";

import { useState } from "react";

import { Ban, Coins, PauseCircle, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

import type { User } from "./user-list-table";

type ActionKind = "suspend" | "ban" | "reinstate" | "points" | "roles" | null;

const ROLES = ["admin", "moderator", "user"];

export function UserAdminActions({ user }: { user: User }) {
  const [action, setAction] = useState<ActionKind>(null);
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("7");
  const [pointsAmount, setPointsAmount] = useState(0);
  const [currency, setCurrency] = useState<"points" | "xp">("points");
  const [roles, setRoles] = useState<string[]>(["user"]);

  const close = () => {
    setAction(null);
    setReason("");
  };

  const isActive = user.status === "active";

  const confirm = () => {
    switch (action) {
      case "suspend":
        toast.success(`Suspended ${user.name} for ${days} days`);
        break;
      case "ban":
        toast.success(`Banned ${user.name}`);
        break;
      case "reinstate":
        toast.success(`Reinstated ${user.name}`);
        break;
      case "points":
        toast.success(`${pointsAmount >= 0 ? "Credited" : "Debited"} ${Math.abs(pointsAmount)} ${currency} to ${user.name}`);
        break;
      case "roles":
        toast.success(`Updated roles for ${user.name}: ${roles.join(", ")}`);
        break;
    }
    close();
  };

  return (
    <>
      <div className="border-border/40 flex flex-wrap items-center gap-2 border-t border-b py-3">
        <span className="text-muted-foreground mr-1 text-xs font-medium">Admin actions</span>
        {isActive ? (
          <>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAction("suspend")}>
              <PauseCircle className="h-4 w-4" /> Suspend
            </Button>
            <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5" onClick={() => setAction("ban")}>
              <Ban className="h-4 w-4" /> Ban
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="border-success/40 text-success hover:bg-success/10 gap-1.5" onClick={() => setAction("reinstate")}>
            <ShieldCheck className="h-4 w-4" /> Reinstate
          </Button>
        )}
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAction("points")}>
          <Coins className="h-4 w-4" /> Adjust points
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAction("roles")}>
          <UserCog className="h-4 w-4" /> Manage roles
        </Button>
      </div>

      <Dialog open={action !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="border-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {action === "points" ? "Adjust balance" : action === "roles" ? "Manage roles" : `${action} user`}
            </DialogTitle>
            <DialogDescription>{user.name} · {user.email}</DialogDescription>
          </DialogHeader>

          {(action === "suspend" || action === "ban") && (
            <div className="space-y-4">
              {action === "suspend" && (
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (logged to enforcement history)" rows={3} />
              </div>
            </div>
          )}

          {action === "reinstate" && (
            <p className="text-muted-foreground text-sm">Restore {user.name} to active status and lift the current enforcement?</p>
          )}

          {action === "points" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (+ credit / − debit)</Label>
                  <Input type="number" value={pointsAmount} onChange={(e) => setPointsAmount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as "points" | "xp")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="border-border bg-card">
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="xp">XP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. goodwill credit" />
              </div>
              <p className="text-muted-foreground text-xs">Posts an admin ledger entry (source: admin, direction: adjust).</p>
            </div>
          )}

          {action === "roles" && (
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label key={r} className="hover:bg-muted/30 flex cursor-pointer items-center gap-2 rounded-md p-2">
                  <Checkbox
                    checked={roles.includes(r)}
                    onCheckedChange={(c) => setRoles((prev) => (c ? [...prev, r] : prev.filter((x) => x !== r)))}
                  />
                  <span className="text-foreground text-sm capitalize">{r}</span>
                </label>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button
              onClick={confirm}
              disabled={(action === "suspend" || action === "ban") && !reason.trim()}
              className={action === "ban" ? "bg-destructive hover:bg-destructive/90" : ""}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
