"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { isPast } from "date-fns";
import { ArrowLeft, Gavel, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { cn } from "@/app/_libs/utils/cn";

import { type ExperienceReward, type ExperienceStatus } from "../../constants";
import { geofenceLabel } from "../../_components/experience-list-item";
import { BidLeaderboardCard } from "./bid-leaderboard-card";
import { BiddingRulesCard } from "./bidding-rules-card";
import { ExperienceDetailsCard } from "./experience-details-card";
import { ExperienceScheduleCard } from "./experience-schedule-card";
import { GeofenceCard, type GeofenceEntry } from "./geofence-card";
import { NotificationsCard, type NotificationsValue } from "./notifications-card";
import { SettleModal } from "./settle-modal";

const STATUS_BADGE: Record<ExperienceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-info/20 text-info",
  live: "bg-success/20 text-success",
  ended: "bg-primary/15 text-primary",
  archived: "bg-muted/50 text-muted-foreground",
};

interface ExperienceFormProps {
  /** undefined → create mode (new draft) */
  experience?: ExperienceReward;
}

interface FormState {
  title: string;
  description: string;
  image: string | null;
  status: ExperienceStatus;
  minBid: number;
  minIncrement: number;
  winners: number;
  bidOpenAt: string; // yyyy-MM-dd
  bidCloseAt: string; // yyyy-MM-dd
  experienceAt: string; // yyyy-MM
  geofence: GeofenceEntry[];
  notifications: NotificationsValue;
  winner?: { user: string; bid: number };
}

function initialState(e?: ExperienceReward): FormState {
  if (!e) {
    return {
      title: "",
      description: "",
      image: null,
      status: "draft",
      minBid: 500,
      minIncrement: 25,
      winners: 1,
      bidOpenAt: "",
      bidCloseAt: "",
      experienceAt: "",
      geofence: [{ code: "GB", live: true }], // first launch: UK
      notifications: {
        outbid: true,
        closingReminders: [36, 24],
        winnerEmailSubject: "",
        winnerEmailBody: "",
      },
    };
  }
  return {
    title: e.title,
    description: e.description,
    image: e.image || null,
    status: e.status,
    minBid: e.minBid,
    minIncrement: e.minIncrement,
    winners: e.winners,
    bidOpenAt: e.bidOpenAt.slice(0, 10),
    bidCloseAt: e.bidCloseAt.slice(0, 10),
    experienceAt: e.experienceAt.slice(0, 7),
    geofence: e.geofence.map((code) => ({ code, live: e.status === "live" || e.status === "ended" })),
    notifications: { ...e.notifications, closingReminders: [...e.notifications.closingReminders] },
    winner: e.winner,
  };
}

export function ExperienceForm({ experience }: ExperienceFormProps) {
  const router = useRouter();
  const isNew = !experience;
  const [form, setForm] = useState<FormState>(() => initialState(experience));
  const [settleOpen, setSettleOpen] = useState(false);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  // Settle is available for a live experience past its bidding close, or an ended
  // one that hasn't been awarded yet. Uses the stored close timestamp (the form's
  // date input is date-only and would round the close to end of day).
  const closePast = experience ? isPast(new Date(experience.bidCloseAt)) : false;
  const canSettle =
    !isNew && !form.winner && ((form.status === "live" && closePast) || form.status === "ended");
  const showLeaderboard = !isNew && (form.status === "live" || form.status === "ended");

  const save = () => {
    if (!form.title.trim()) {
      toast.error("Give the experience a title first.");
      return;
    }
    if (isNew) {
      toast.success(`Created "${form.title}" as a draft.`);
      router.push("/rewards" as Route);
    } else {
      toast.success(`Saved changes to "${form.title}".`);
    }
  };

  const settle = () => {
    const top = experience?.leaderboard.slice(0, form.winners) ?? [];
    patch({ status: "ended", winner: top[0] ? { user: top[0].user, bid: top[0].bid } : undefined });
    setSettleOpen(false);
    toast.success(
      top[0]
        ? `Settled "${form.title}" — awarded to ${top
            .map((w) => w.user)
            .join(", ")}; winner email sent.`
        : `Settled "${form.title}" — ended with no bids.`,
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href={"/rewards" as Route} aria-label="Back to Rewards">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-gaming text-foreground text-2xl font-bold">
                {isNew ? "New Experience" : form.title || "Experience"}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  STATUS_BADGE[form.status],
                )}>
                {form.status}
              </span>
            </div>
            <p className="text-foreground-secondary mt-0.5 text-sm">
              {isNew
                ? "Configure a points-based auction for a real-world experience."
                : geofenceLabel(form.geofence.map((g) => g.code))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canSettle && (
            <Button variant="outline" className="gap-2" onClick={() => setSettleOpen(true)}>
              <Gavel className="h-4 w-4" /> Settle &amp; award
            </Button>
          )}
          <Button className="gap-2" onClick={save}>
            <Save className="h-4 w-4" /> {isNew ? "Create" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Sectioned cards on one scrolling page (no stepper — fewer fields than a video) */}
      <div className="space-y-6">
        <ExperienceDetailsCard
          title={form.title}
          description={form.description}
          image={form.image}
          onTitleChange={(title) => patch({ title })}
          onDescriptionChange={(description) => patch({ description })}
          onImageChange={(image) => patch({ image })}
        />

        <BiddingRulesCard
          minBid={form.minBid}
          minIncrement={form.minIncrement}
          winners={form.winners}
          bidOpenAt={form.bidOpenAt}
          bidCloseAt={form.bidCloseAt}
          onChange={patch}
        />

        <ExperienceScheduleCard
          experienceAt={form.experienceAt}
          status={form.status}
          onExperienceAtChange={(experienceAt) => patch({ experienceAt })}
          onStatusChange={(status) => patch({ status })}
        />

        <GeofenceCard geofence={form.geofence} onChange={(geofence) => patch({ geofence })} />

        <NotificationsCard
          value={form.notifications}
          onChange={(notifications) => patch({ notifications })}
        />

        {showLeaderboard && experience && (
          <BidLeaderboardCard
            experience={{ ...experience, winners: form.winners }}
            ended={form.status === "ended"}
          />
        )}
      </div>

      {!isNew && experience && (
        <SettleModal
          open={settleOpen}
          onOpenChange={setSettleOpen}
          experience={{ ...experience, winners: form.winners }}
          onConfirm={settle}
        />
      )}
    </div>
  );
}
