"use client";

import { useState } from "react";

import { format } from "date-fns";
import { CalendarIcon, Clock, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/app/_libs/utils/cn";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle?: string;
  onConfirm?: (config: ScheduleConfig) => void;
}

export interface ScheduleConfig {
  date: Date;
  time: string;
  timezone: string;
}

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "EST (Eastern Standard Time)" },
  { value: "America/Los_Angeles", label: "PST (Pacific Standard Time)" },
  { value: "Europe/London", label: "GMT (Greenwich Mean Time)" },
  { value: "Europe/Paris", label: "CET (Central European Time)" },
  { value: "Asia/Tokyo", label: "JST (Japan Standard Time)" },
  { value: "Asia/Shanghai", label: "CST (China Standard Time)" },
  { value: "Asia/Kolkata", label: "IST (India Standard Time)" },
];

export function ScheduleModal({ open, onOpenChange, videoTitle, onConfirm }: ScheduleModalProps) {
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [time, setTime] = useState("20:00");
  const [timezone, setTimezone] = useState("UTC");

  const handleConfirm = () => {
    if (date && onConfirm) {
      onConfirm({
        date,
        time,
        timezone,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="text-primary h-5 w-5" />
            Schedule Publication
          </DialogTitle>
          <DialogDescription>
            {videoTitle
              ? `Schedule "${videoTitle}" for later`
              : "Set when this video should go live"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">Publication Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "EEEE, MMMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(d) => d < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">Publication Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Timezone Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {date && (
            <div className="border-primary/30 bg-primary/10 rounded-lg border p-3">
              <p className="text-foreground text-sm">
                This video will be published on{" "}
                <span className="font-semibold">
                  {format(date, "MMMM d, yyyy")} at {time}
                </span>{" "}
                ({timezone})
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!date}>
            <Clock className="mr-2 h-4 w-4" />
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
