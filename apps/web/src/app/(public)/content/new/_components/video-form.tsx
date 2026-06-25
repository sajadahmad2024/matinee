"use client";

import { useState } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  DollarSign,
  FileText,
  Film,
  Gavel,
  Globe,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Step-based workflow (PDF): Details → Rights → Media → Distribution → Monetisation.
const STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "details", label: "Details", icon: FileText },
  { key: "rights", label: "Rights", icon: Gavel },
  { key: "media", label: "Media", icon: Film },
  { key: "distribution", label: "Distribution", icon: Globe },
  { key: "monetisation", label: "Monetisation", icon: DollarSign },
];
const SUGGESTED_GENRES = ["Action", "Drama", "Thriller", "Sci-Fi"];
const SUGGESTED_TAGS = ["trailer", "exclusive", "behind-the-scenes", "2024"];

import { BoostModal } from "./boost-modal";
import { ContentClassificationCard } from "./content-classification-card";
import { GameAssociationCard, type GameInstance } from "./game-association-card";
import { LicensingCard } from "./licensing-card";
import { MediaUploadCard } from "./media-upload-card";
import { ScheduleModal } from "./schedule-modal";
import { SponsorshipCard } from "./sponsorship-card";
import { VideoDetailsCard } from "./video-details-card";

interface VideoFormProps {
  initialData?: {
    id?: string;
    title?: string;
    studioName?: string;
    description?: string;
    genre?: string;
    tags?: string;
    cast?: string[];
    isPublished?: boolean;
    gameInstances?: GameInstance[];
  };
  sidebar?: React.ReactNode; // Optional extra content for the right column
}

export function VideoForm({ initialData, sidebar }: VideoFormProps) {
  const router = useRouter();
  const isNew = !initialData?.id;

  // --- Form State ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [studioName, setStudioName] = useState(initialData?.studioName || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [genre, setGenre] = useState(initialData?.genre || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [cast, setCast] = useState<string[]>(initialData?.cast || []);
  const [newCast, setNewCast] = useState("");

  const [gameInstances, setGameInstances] = useState<GameInstance[]>(
    initialData?.gameInstances || [],
  );
  const [selectedFormat, setSelectedFormat] = useState("");

  // --- Modal States ---
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const [step, setStep] = useState(0);
  const addTag = (t: string) => setTags(tags.trim() ? `${tags}, ${t}` : t);

  // --- Actions ---
  const addCast = () => {
    if (newCast.trim()) {
      setCast([...cast, newCast.trim()]);
      setNewCast("");
    }
  };

  const removeCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const addGameInstance = () => {
    if (!selectedFormat) return;
    const gameFormats = [
      { id: "watch_streak", name: "Watch Streak", icon: "🔥", requiresVideo: false },
      { id: "predict_outcome", name: "Predict Outcome", icon: "🎯", requiresVideo: true },
      { id: "weekly_quest", name: "Weekly Contest", icon: "📅", requiresVideo: false },
    ];
    const format = gameFormats.find((f) => f.id === selectedFormat);
    if (!format) return;

    setGameInstances([
      ...gameInstances,
      {
        id: crypto.randomUUID(),
        formatId: format.id,
        name: format.name,
        description: "",
        rewardPoints: 0,
        experiencePoints: 0,
      },
    ]);
    setSelectedFormat("");
  };

  const handleSave = () => {
    toast.success(isNew ? "Video created successfully" : "Video updated successfully");
    if (isNew) router.push("/content" as Route);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/content" as Route)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-gaming text-foreground text-2xl font-bold">
              {isNew ? "Add New Video" : title}
            </h1>
            {isNew && (
              <p className="text-foreground-secondary text-sm">
                Upload and configure your new content
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const state = i === step ? "active" : i < step ? "done" : "todo";
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                state === "active"
                  ? "border-primary bg-primary/15 text-primary"
                  : state === "done"
                    ? "border-success/40 text-success"
                    : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}>
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">
                {i + 1}. {s.label}
              </span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Step content — one focused step at a time to reduce cognitive load */}
      <div className="space-y-6">
        {step === 0 && (
          <>
            <VideoDetailsCard
              title={title}
              setTitle={setTitle}
              studioName={studioName}
              setStudioName={setStudioName}
              description={description}
              setDescription={setDescription}
              genre={genre}
              setGenre={setGenre}
              tags={tags}
              setTags={setTags}
              cast={cast}
              newCast={newCast}
              setNewCast={setNewCast}
              onAddCast={addCast}
              onRemoveCast={removeCast}
            />

            {/* Contextual recommendations — help users complete content faster */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="text-accent h-4 w-4" /> Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">Suggested genres</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_GENRES.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGenre(g)}
                        className="border-border/50 hover:border-primary hover:text-primary rounded-full border px-3 py-1 text-xs transition-colors">
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">Suggested tags</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => addTag(t)}
                        className="border-border/50 hover:border-primary hover:text-primary rounded-full border px-3 py-1 text-xs transition-colors">
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {step === 1 && <LicensingCard />}

        {step === 2 && <MediaUploadCard />}

        {step === 3 && <ContentClassificationCard />}

        {step === 4 && (
          <>
            <GameAssociationCard
              gameInstances={gameInstances}
              onSetGameInstances={setGameInstances}
              selectedFormat={selectedFormat}
              onSetSelectedFormat={setSelectedFormat}
              onAddGameInstance={addGameInstance}
              onRemoveGameInstance={(id) => setGameInstances(gameInstances.filter((g) => g.id !== id))}
            />
            <SponsorshipCard />
          </>
        )}

        {sidebar}
      </div>

      {/* Sticky footer — publish actions stay accessible regardless of form length */}
      <div className="bg-background/95 border-border/50 sticky bottom-0 z-20 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="gap-1">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <span className="text-muted-foreground text-xs">Final step — ready to publish</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave}>
            Save Draft
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Approval request sent")}>
            Request Approval
          </Button>
          <Button variant="outline" size="sm" onClick={() => setScheduleModalOpen(true)}>
            Schedule
          </Button>
          <Button size="sm" onClick={handleSave}>
            {initialData?.isPublished ? "Update" : "Publish Now"}
          </Button>
        </div>
      </div>

      <BoostModal
        open={boostModalOpen}
        onOpenChange={setBoostModalOpen}
        videoTitle={title}
        onConfirm={() => toast.success("Boost activated")}
      />
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        videoTitle={title}
        onConfirm={() => toast.success("Video scheduled")}
      />
    </div>
  );
}
