"use client";

import { useState } from "react";

import { Bell, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

export interface NotificationsValue {
  outbid: boolean;
  closingReminders: number[]; // hours before close
  winnerEmailSubject: string;
  winnerEmailBody: string;
}

interface NotificationsCardProps {
  value: NotificationsValue;
  onChange: (next: NotificationsValue) => void;
}

export function NotificationsCard({ value, onChange }: NotificationsCardProps) {
  const [newReminder, setNewReminder] = useState("");

  const addReminder = () => {
    const hours = Number(newReminder);
    if (!hours || hours <= 0 || value.closingReminders.includes(hours)) return;
    onChange({
      ...value,
      closingReminders: [...value.closingReminders, hours].sort((a, b) => b - a),
    });
    setNewReminder("");
  };

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="text-warning h-4 w-4" /> Notifications
        </CardTitle>
        <CardDescription>Customizable notification experience for bidders and winners.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>Notify bidder when outbid</Label>
            <p className="text-muted-foreground text-xs">
              In-app notification the moment a higher bid lands.
            </p>
          </div>
          <Switch
            checked={value.outbid}
            onCheckedChange={(v) => onChange({ ...value, outbid: v })}
            aria-label="Notify bidder when outbid"
          />
        </div>

        <div className="space-y-2">
          <Label>Closing reminders (hours before close)</Label>
          <div className="flex flex-wrap items-center gap-2">
            {value.closingReminders.map((h) => (
              <span
                key={h}
                className="bg-muted/40 text-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                {h}h before
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    onChange({
                      ...value,
                      closingReminders: value.closingReminders.filter((x) => x !== h),
                    })
                  }
                  aria-label={`Remove ${h}h reminder`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                placeholder="hrs"
                className="h-8 w-20"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={addReminder}
                aria-label="Add closing reminder">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp-winner-subject">Winner email — subject</Label>
          <Input
            id="exp-winner-subject"
            value={value.winnerEmailSubject}
            onChange={(e) => onChange({ ...value, winnerEmailSubject: e.target.value })}
            placeholder="You won: …"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp-winner-body">Winner email — body</Label>
          <Textarea
            id="exp-winner-body"
            rows={3}
            value={value.winnerEmailBody}
            onChange={(e) => onChange({ ...value, winnerEmailBody: e.target.value })}
            placeholder="Congratulations! …"
          />
          <p className="text-muted-foreground text-xs">
            Sent automatically when the experience is settled.
          </p>
        </div>
      </CardContent>
    </GlassCard>
  );
}
