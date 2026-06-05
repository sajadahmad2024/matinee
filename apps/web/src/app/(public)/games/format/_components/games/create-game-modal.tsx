"use client";

import { useState } from "react";

import { Check, Film, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/app/_libs/utils/cn";

import { AVAILABLE_VIDEOS } from "../../constants";

interface CreateGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatConfig: { name: string; requiresVideo: boolean } | null;
  formatId: string;
  FormatIcon: React.ElementType;
}

export function CreateGameModal({
  open,
  onOpenChange,
  formatConfig,
  formatId,
  FormatIcon,
}: CreateGameModalProps) {
  // --- Local Form State (Encapsulated) ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState(100);
  const [xp, setXp] = useState(50);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState("");

  // Format-specific state
  const [predictionQuestion, setPredictionQuestion] = useState("");
  const [predictionOptions, setPredictionOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  // Helpers
  const filteredVideos = AVAILABLE_VIDEOS.filter((v) =>
    v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()),
  );

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a game name");
      return;
    }
    if (formatConfig?.requiresVideo && !selectedVideoId) {
      toast.error("This format requires linking a video");
      return;
    }

    // In the future: const response = await createGameServerAction({ ...state })
    toast.success(`Game "${name}" created successfully`);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedVideoId(null);
    setVideoSearchQuery("");
    setPredictionQuestion("");
    setPredictionOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-2xl!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-accent/10 rounded-lg p-1.5">
              <FormatIcon className="text-accent h-5 w-5" />
            </div>
            Create {formatConfig?.name} Game
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto px-1 py-2">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Game Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Avengers Finale Quiz"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short explanation for players"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reward Points</Label>
                <Input
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>XP Awarded</Label>
                <Input type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Format Specific Logic */}
          <div className="border-border border-t pt-6">
            {formatId === "1" && (
              <div className="space-y-6">
                <div className="bg-accent/5 border-accent/20 rounded-lg border p-4">
                  <h5 className="text-accent mb-4 flex items-center gap-2 text-sm font-semibold">
                    <Film className="h-4 w-4" />
                    Video Content Link
                  </h5>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                      <Input
                        className="pl-9"
                        placeholder="Search for a trailer or video..."
                        value={videoSearchQuery}
                        onChange={(e) => setVideoSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      {filteredVideos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => setSelectedVideoId(video.id)}
                          className={cn(
                            "hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors",
                            selectedVideoId === video.id
                              ? "border-accent bg-accent/5 ring-accent/20 ring-1"
                              : "border-border",
                          )}>
                          <div className="flex items-center gap-3">
                            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                              <Film className="text-muted-foreground h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{video.title}</p>
                              <p className="text-muted-foreground text-xs">
                                {video.duration} • {video.views.toLocaleString()} views
                              </p>
                            </div>
                          </div>
                          {selectedVideoId === video.id && (
                            <Check className="text-accent h-4 w-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="flex items-center gap-2 text-sm font-semibold">
                    <Check className="h-4 w-4" />
                    Prediction Setup
                  </h5>
                  <div className="space-y-3">
                    <Label className="text-xs">Question</Label>
                    <Input
                      placeholder="What will happen in the next scene?"
                      value={predictionQuestion}
                      onChange={(e) => setPredictionQuestion(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {predictionOptions.map((opt, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <Label className="text-xs">Option {idx + 1}</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...predictionOptions];
                              newOpts[idx] = e.target.value;
                              setPredictionOptions(newOpts);
                            }}
                          />
                          <Button
                            variant={correctAnswer === opt && opt !== "" ? "default" : "outline"}
                            size="icon"
                            className="shrink-0"
                            onClick={() => setCorrectAnswer(opt)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other formatId (2, 3) blocks would go here similarly encapsulated */}
          </div>
        </div>

        <div className="border-border mt-2 flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Game</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
