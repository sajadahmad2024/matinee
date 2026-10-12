"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Clock, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CustomDatePicker } from "@/components/custom/custom-date-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";

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

const TIMEZONE_OPTIONS: CustomSelectOption[] = [
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
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      appearance="default"
      className="max-w-md"
      titleClassName="flex items-center gap-2"
      title={
        <>
          <Clock className="text-primary h-5 w-5" />
          Schedule Publication
        </>
      }
      description={
        videoTitle ? `Schedule "${videoTitle}" for later` : "Set when this video should go live"
      }
      footerClassName="mt-4 flex-row justify-end"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!date}>
            <Clock className="mr-2 h-4 w-4" />
            Schedule
          </Button>
        </>
      }>
      <div className="space-y-6">
        <CustomField label="Publication Date" labelClassName="text-foreground">
          <CustomDatePicker
            value={date}
            onChange={setDate}
            dateFormat="EEEE, MMMM d, yyyy"
            isDateDisabled={(d) => d < new Date()}
          />
        </CustomField>

        <CustomField
          label="Publication Time"
          htmlFor="schedule-time"
          labelClassName="text-foreground">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1"
            />
          </div>
        </CustomField>

        <CustomField label="Timezone" htmlFor="schedule-timezone" labelClassName="text-foreground">
          <CustomSelect
            id="schedule-timezone"
            options={TIMEZONE_OPTIONS}
            value={timezone}
            onValueChange={setTimezone}
            leftIcon={<Globe className="mr-2 h-4 w-4" />}
            triggerClassName="w-full"
            contentClassName=""
          />
        </CustomField>

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
    </CustomModal>
  );
}
