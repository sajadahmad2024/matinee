"use client";

import { useState } from "react";

import { Mail, Shield, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { type Admin } from "./types";

interface InviteAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (admin: Partial<Admin>) => void;
}

export function InviteAdminModal({ open, onOpenChange, onInvite }: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"super_admin" | "admin">("admin");
  const [message, setMessage] = useState("");

  const handleInvite = () => {
    onInvite({
      email,
      role,
      name: email.split("@")[0],
    });
    onOpenChange(false);
    setEmail("");
    setRole("admin");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New Admin</DialogTitle>
          <DialogDescription>Send an invitation to join your admin team</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                <SelectItem value="super_admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-primary h-4 w-4" />
                    Super Admin
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="text-accent h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {role === "super_admin"
                ? "Full access except Admin Management"
                : "Full access, cannot see Admin Mgmt, publish button disabled"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Personal Message (Optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Welcome to the team..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gap-2" onClick={handleInvite} disabled={!email}>
            <Mail className="h-4 w-4" />
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
