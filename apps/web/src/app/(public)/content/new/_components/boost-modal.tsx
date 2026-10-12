"use client";

import { useMemo, useState } from "react";

import { differenceInDays } from "date-fns";
import { Clock, Globe, Rocket, Star, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/app/_libs/utils/cn";
import { CustomDatePicker } from "@/components/custom/custom-date-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";

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
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      appearance="default"
      className="max-w-lg"
      titleClassName="flex items-center gap-2"
      title={
        <>
          <Rocket className="text-featured h-5 w-5" />
          Boost Content
        </>
      }
      description={
        videoTitle ? `Boost "${videoTitle}" for maximum visibility` : "Configure boost settings"
      }
      footerClassName="mt-4 flex-row justify-end"
      footer={
        <>
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
        </>
      }>
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
              <Badge variant="outline" className="text-featured border-featured/30 bg-featured/10">
                <Clock className="mr-1 h-3 w-3" />
                {daysSelected} day{daysSelected > 1 ? "s" : ""} selected
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomField
              label="Start Date"
              htmlFor="boost-start-time"
              labelClassName="text-muted-foreground text-xs">
              <CustomDatePicker
                value={startDate}
                onChange={setStartDate}
                isDateDisabled={(date) => date < new Date()}
              />
              <Input
                id="boost-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-2"
              />
            </CustomField>

            <CustomField
              label="End Date"
              htmlFor="boost-end-time"
              labelClassName="text-muted-foreground text-xs">
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
                isDateDisabled={(date) => (startDate ? date < startDate : date < new Date())}
              />
              <Input
                id="boost-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-2"
              />
            </CustomField>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
