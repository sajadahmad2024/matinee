"use client";

import { useMemo, useState } from "react";

import { differenceInDays, format } from "date-fns";
import { CalendarIcon, Clock, Globe, Rocket, Star, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";

import { cn } from "@/app/_libs/utils/cn";

interface BoostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle?: string;
  onConfirm?: (config: BoostConfig) => void;
}

export interface BoostConfig {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  criteria: string[];
}

const boostCriteria = [
  {
    id: "homepage",
    label: "Homepage Featured",
    icon: Star,
    description: "Show on homepage carousel",
  },
  { id: "notifications", label: "Push Notifications", icon: Zap, description: "Send to all users" },
  {
    id: "regional",
    label: "Regional Boost",
    icon: Globe,
    description: "Priority in user's region",
  },
  {
    id: "subscribers",
    label: "Subscribers First",
    icon: Users,
    description: "Notify subscribed users first",
  },
];

export function BoostModal({ open, onOpenChange, videoTitle, onConfirm }: BoostModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(["homepage"]);

  const daysSelected = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  }, [startDate, endDate]);

  const toggleCriteria = (id: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    if (startDate && endDate && onConfirm) {
      onConfirm({
        startDate,
        endDate,
        startTime,
        endTime,
        criteria: selectedCriteria,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="text-featured h-5 w-5" />
            Boost Content
          </DialogTitle>
          <DialogDescription>
            {videoTitle
              ? `Boost "${videoTitle}" for maximum visibility`
              : "Configure boost settings"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Boost Criteria */}
          <div className="space-y-3">
            <Label className="text-foreground">Boost Criteria</Label>
            <div className="grid grid-cols-2 gap-3">
              {boostCriteria.map((criteria) => (
                <div
                  key={criteria.id}
                  onClick={() => toggleCriteria(criteria.id)}
                  className={cn(
                    "border-border hover:border-featured/50 cursor-pointer rounded-lg border-2 transition-all",
                    selectedCriteria.includes(criteria.id)
                      ? "border-featured bg-featured/10"
                      : "border-border hover:border-featured/50",
                  )}>
                  <div className="mb-1 flex items-center gap-2 p-3 pb-0">
                    <Checkbox
                      checked={selectedCriteria.includes(criteria.id)}
                      onCheckedChange={() => toggleCriteria(criteria.id)}
                    />
                    <criteria.icon
                      className={cn(
                        "h-4 w-4",
                        selectedCriteria.includes(criteria.id)
                          ? "text-featured"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="text-foreground text-sm font-medium">{criteria.label}</span>
                  </div>
                  <p className="text-muted-foreground ml-9 pr-3 pb-3 text-xs">
                    {criteria.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Boost Period</Label>
              {daysSelected > 0 && (
                <Badge
                  variant="outline"
                  className="text-featured border-featured/30 bg-featured/10">
                  <Clock className="mr-1 h-3 w-3" />
                  {daysSelected} day{daysSelected > 1 ? "s" : ""} selected
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : date < new Date())}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!startDate || !endDate || selectedCriteria.length === 0}
            className="bg-featured hover:bg-featured/90 gap-2">
            <Rocket className="h-4 w-4" />
            Activate Boost
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
