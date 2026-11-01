"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CustomDatePicker } from "@/components/custom/custom-date-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomTimePicker } from "@/components/custom/custom-time-picker";

import type { ScheduleConfig } from "../../_libs/video-form/schedule";
import { localZoneLabel } from "../content-format";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle?: string;
  /** The current go-live (ISO) when rescheduling — the pickers open on it. */
  scheduledAt?: string | null;
  onConfirm?: (config: ScheduleConfig) => void;
}

const DEFAULT_TIME = "01:00";

/** Opening values: the current go-live in local time, else tomorrow at the default time. */
const initialSchedule = (scheduledAt?: string | null) => {
  if (scheduledAt) {
    const at = new Date(scheduledAt);
    return { date: at, time: format(at, "HH:mm") };
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { date: tomorrow, time: DEFAULT_TIME };
};

export function ScheduleModal({
  open,
  onOpenChange,
  videoTitle,
  scheduledAt,
  onConfirm,
}: ScheduleModalProps) {
  const [date, setDate] = useState<Date | undefined>(() => initialSchedule(scheduledAt).date);
  const [time, setTime] = useState(() => initialSchedule(scheduledAt).time);

  // Each opening starts from the video's current go-live, not the last unsaved pick.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const initial = initialSchedule(scheduledAt);
      setDate(initial.date);
      setTime(initial.time);
    }
  }
  // The zone on the picked day, so daylight saving matches it ("EDT" in July, "EST" in December).
  const zoneLabel = localZoneLabel(date);

  const handleConfirm = () => {
    if (date && onConfirm) {
      onConfirm({ date, time });
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
          {scheduledAt ? "Reschedule Publication" : "Schedule Publication"}
        </>
      }
      description={
        videoTitle ? `Schedule "${videoTitle}" for later` : "Set when this video should go live"
      }
      footerClassName="mt-4 flex-row justify-end"
      footer={
        <>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleConfirm} disabled={!date}>
            <Clock className="mr-2 h-4 w-4" />
            {scheduledAt ? "Reschedule" : "Schedule"}
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
          <CustomTimePicker id="schedule-time" value={time} onChange={setTime} />
          <p className="text-muted-foreground mt-1.5 text-xs">
            In your local timezone: {zoneLabel}
          </p>
        </CustomField>
      </div>
    </CustomModal>
  );
}
