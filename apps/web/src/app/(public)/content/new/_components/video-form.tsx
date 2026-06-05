"use client";

import { useState } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { BoostModal } from "./boost-modal";
import { ContentClassificationCard } from "./content-classification-card";
import { GameAssociationCard, type GameInstance } from "./game-association-card";
import { MediaUploadCard } from "./media-upload-card";
import { ScheduleModal } from "./schedule-modal";
import { SponsorshipCard } from "./sponsorship-card";
import { VideoActionsCard } from "./video-actions-card";
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="space-y-6 lg:col-span-2">
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

          <ContentClassificationCard />

          <MediaUploadCard />

          <GameAssociationCard
            gameInstances={gameInstances}
            onSetGameInstances={setGameInstances}
            selectedFormat={selectedFormat}
            onSetSelectedFormat={setSelectedFormat}
            onAddGameInstance={addGameInstance}
            onRemoveGameInstance={(id) =>
              setGameInstances(gameInstances.filter((g) => g.id !== id))
            }
          />

          <SponsorshipCard />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <VideoActionsCard
            isPublished={initialData?.isPublished}
            onUpdate={handleSave}
            onSaveDraft={handleSave}
            onRequestApproval={() => toast.success("Approval request sent")}
            onSchedule={() => setScheduleModalOpen(true)}
            onPublish={handleSave}
            onBoost={() => setBoostModalOpen(true)}
          />

          {/* Inject extra sidebar content here */}
          {sidebar}
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
