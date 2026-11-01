"use client";

import { useState } from "react";

import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";
import { Clock, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  BoostContentDtoChannelsEnum as BoostChannel,
  type BoostContentDto,
} from "@/app/_libs/api/generated";
import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomDatePicker } from "@/components/custom/custom-date-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";

import { BOOST_CHANNELS } from "../../_libs/video-form/boost/boost-options";
import { scheduleToIso } from "../../_libs/video-form/schedule";
import { localZoneLabel, parseApiDate } from "../content-format";

/** The video's current boost, to open the modal on it ("Edit boost"). */
export interface CurrentBoost {
  startsAt?: string | null;
  until?: string | null;
  channels?: string[] | null;
}

interface BoostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle?: string;
  current?: CurrentBoost | null;
  isSaving?: boolean;
  /** The `POST /:id/boost` body — times in UTC. The caller closes the modal on success. */
  onConfirm?: (boost: BoostContentDto) => void;
}

const CHANNELS = Object.values(BoostChannel)?.map((id) => ({ id, ...BOOST_CHANNELS[id] }));
const DEFAULT_CHANNELS: BoostChannel[] = [BoostChannel.Homepage];
const DEFAULT_LENGTH_DAYS = 7;

const isChannel = (value: string): value is BoostChannel =>
  (Object.values(BoostChannel) as string[]).includes(value);

/** Opening values: the current boost in local time, else from now for a week. */
const initialBoost = (current?: CurrentBoost | null) => {
  const start = parseApiDate(current?.startsAt) ?? new Date();
  const end = parseApiDate(current?.until) ?? addDays(start, DEFAULT_LENGTH_DAYS);
  const channels = current?.channels?.filter(isChannel);
  return {
    startDate: start,
    startTime: format(start, "HH:mm"),
    endDate: end,
    endTime: format(end, "HH:mm"),
    channels: channels?.length ? channels : DEFAULT_CHANNELS,
  };
};

export function BoostModal({
  open,
  onOpenChange,
  videoTitle,
  current,
  isSaving,
  onConfirm,
}: BoostModalProps) {
  const [form, setForm] = useState(() => initialBoost(current));

  // Each opening starts from the video's current boost, not the last unsaved pick.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(initialBoost(current));
  }

  const { startDate, startTime, endDate, endTime, channels } = form;
  const startsAt = startDate ? scheduleToIso({ date: startDate, time: startTime }) : undefined;
  const until = endDate ? scheduleToIso({ date: endDate, time: endTime }) : undefined;

  const error = (() => {
    if (!startsAt || !until) return "Pick a start and an end.";
    if (new Date(until) <= new Date(startsAt)) return "The end must be after the start.";
    if (new Date(until) <= new Date()) return "The end must be in the future.";
    if (!channels?.length) return "Pick at least one channel.";
    return undefined;
  })();
  const daysSelected = startDate && endDate ? differenceInCalendarDays(endDate, startDate) + 1 : 0;

  const toggleChannel = (id: BoostChannel) =>
    setForm((prev) => ({
      ...prev,
      channels: prev?.channels?.includes(id)
        ? prev?.channels?.filter((c) => c !== id)
        : [...(prev?.channels ?? []), id],
    }));

  const confirm = () => {
    if (error || !startsAt || !until) return;
    onConfirm?.({ boosted: true, startsAt, until, channels });
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
          {current?.until ? "Edit Boost" : "Boost Content"}
        </>
      }
      description={
        videoTitle ? `Boost "${videoTitle}" for maximum visibility` : "Configure boost settings"
      }
      footerClassName="mt-4 flex-row justify-end"
      footer={
        <>
          <CustomButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={confirm}
            disabled={!!error}
            isLoading={isSaving}
            loadingText="Saving…"
            leftIcon={<Rocket className="h-4 w-4" />}
            className="bg-featured hover:bg-featured/90">
            {current?.until ? "Update Boost" : "Activate Boost"}
          </CustomButton>
        </>
      }>
      <div className="space-y-6">
        {/* Channels */}
        <div className="space-y-3">
          <Label className="text-foreground">Boost Channels</Label>
          <div className="grid grid-cols-2 gap-3">
            {CHANNELS?.map((channel) => {
              const selected = channels?.includes(channel?.id);
              return (
                <div
                  key={channel?.id}
                  onClick={() => toggleChannel(channel?.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border-2 transition-all",
                    selected
                      ? "border-featured bg-featured/10"
                      : "border-border hover:border-featured/50",
                  )}>
                  <div className="mb-1 flex items-center gap-2 p-3 pb-0">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleChannel(channel?.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <channel.icon
                      className={cn(
                        "h-4 w-4",
                        selected ? "text-featured" : "text-muted-foreground",
                      )}
                    />
                    <span className="text-foreground text-sm font-medium">{channel?.label}</span>
                  </div>
                  <p className="text-muted-foreground ml-9 pr-3 pb-3 text-xs">
                    {channel?.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Period */}
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
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, startDate: date ?? prev.startDate }))
                }
                isDateDisabled={(date) => date < startOfDay(new Date())}
              />
              <Input
                id="boost-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                className="mt-2"
              />
            </CustomField>

            <CustomField
              label="End Date"
              htmlFor="boost-end-time"
              labelClassName="text-muted-foreground text-xs">
              <CustomDatePicker
                value={endDate}
                onChange={(date) => setForm((prev) => ({ ...prev, endDate: date ?? prev.endDate }))}
                isDateDisabled={(date) => date < startOfDay(startDate ?? new Date())}
              />
              <Input
                id="boost-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                className="mt-2"
              />
            </CustomField>
          </div>
          <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {error ?? `In your local timezone: ${localZoneLabel(startDate)}`}
          </p>
        </div>
      </div>
    </CustomModal>
  );
}
