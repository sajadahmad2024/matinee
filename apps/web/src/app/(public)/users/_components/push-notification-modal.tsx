"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Bell, CalendarIcon, Clock, Link, Send, Upload, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/app/_libs/utils/cn";

import type { User } from "./user-list-table";

interface PushNotificationModalProps {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PushNotificationModal({ users, open, onOpenChange }: PushNotificationModalProps) {
  const [target, setTarget] = useState<"all" | "selected">("selected");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [sendType, setSendType] = useState<"now" | "scheduled">("now");
  const [scheduleDate, setScheduleDate] = useState<Date>();

  const handleSend = () => {
    // Handle send logic
    console.warn("Sending notification:", {
      target,
      users: target === "selected" ? users : "all",
      title,
      message,
      deepLink,
      sendType,
      scheduleDate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card w-full max-w-2xl!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="text-accent h-5 w-5" />
            Send Push Notification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Target Selection */}
          <div className="space-y-3">
            <Label>Target Audience</Label>
            <RadioGroup
              value={target}
              onValueChange={(v) => setTarget(v as "all" | "selected")}
              className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected" className="cursor-pointer font-normal">
                  Selected Users
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer font-normal">
                  All Users
                </Label>
              </div>
            </RadioGroup>

            {target === "selected" && users.length > 0 && (
              <div className="bg-muted/30 flex flex-wrap gap-2 rounded-lg p-3">
                <Users className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  {users.length} user(s) selected:
                </span>
                {users.slice(0, 3).map((user) => (
                  <Badge key={user.id} variant="secondary" className="text-xs">
                    {user.name}
                  </Badge>
                ))}
                {users.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{users.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Title</Label>
              <Input
                placeholder="e.g., New Video Alert!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Message Body</Label>
              <Textarea
                placeholder="Write your notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <div className="flex items-center gap-3">
                <div className="bg-muted/50 border-border flex h-20 w-20 items-center justify-center rounded-lg border border-dashed">
                  <Upload className="text-muted-foreground h-6 w-6" />
                </div>
                <Button variant="outline" size="sm">
                  Upload Image
                </Button>
              </div>
            </div>
          </div>

          {/* Deep Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Deep Link (Optional)
            </Label>
            <Select value={deepLink} onValueChange={setDeepLink}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination..." />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="none">No deep link</SelectItem>
                <SelectItem value="video_avengers">Video: Avengers Endgame</SelectItem>
                <SelectItem value="video_batman">Video: The Batman</SelectItem>
                <SelectItem value="game_streak">Game: Watch Streak</SelectItem>
                <SelectItem value="subscription">Subscription Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scheduling */}
          <div className="space-y-3">
            <Label>Scheduling</Label>
            <RadioGroup
              value={sendType}
              onValueChange={(v) => setSendType(v as "now" | "scheduled")}
              className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="cursor-pointer font-normal">
                  Send Now
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="cursor-pointer font-normal">
                  Schedule
                </Label>
              </div>
            </RadioGroup>

            {sendType === "scheduled" && (
              <div className="flex gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground",
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="border-border bg-card z-50 w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Select>
                  <SelectTrigger className="w-[120px]">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card z-50">
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                    <SelectItem value="21:00">09:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-border flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} className="gap-2">
              <Send className="h-4 w-4" />
              {sendType === "now" ? "Send Now" : "Schedule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
