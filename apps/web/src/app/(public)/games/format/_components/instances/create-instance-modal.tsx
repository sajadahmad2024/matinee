"use client";

import { useState } from "react";

import { Check, Film, ImagePlus, Lock, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/app/_libs/utils/cn";

import { AVAILABLE_VIDEOS } from "../../constants";
import { BannerUpload } from "../shared/banner-upload";

export type InstanceKind = "quest" | "prediction" | "auction";

const TITLES: Record<InstanceKind, { title: string; nameLabel: string; namePh: string }> = {
  quest: { title: "Create Quest", nameLabel: "Quest name", namePh: "e.g., Marvel Marathon Week" },
  prediction: {
    title: "Create Prediction",
    nameLabel: "Question",
    namePh: "e.g., Who wins Best Picture at the IIFA awards?",
  },
  auction: { title: "Create Auction", nameLabel: "Title", namePh: "e.g., Meet the cast — premiere" },
};

interface CreateInstanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: InstanceKind;
}

interface PredictionOption {
  id: string;
  label: string;
  mediaUrl: string;
}

export function CreateInstanceModal({ open, onOpenChange, kind }: CreateInstanceModalProps) {
  const cfg = TITLES[kind];

  // common
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [rewardPoints, setRewardPoints] = useState(100);
  const [rewardXp, setRewardXp] = useState(50);

  // quest
  const [videoSearch, setVideoSearch] = useState("");
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [weeks, setWeeks] = useState("1");

  // prediction
  const [visualUrl, setVisualUrl] = useState("");
  const [cadence, setCadence] = useState("monthly");
  const [entryCost, setEntryCost] = useState(50);
  const [multiplier, setMultiplier] = useState("5");
  const [options, setOptions] = useState<PredictionOption[]>([
    { id: "o1", label: "", mediaUrl: "" },
    { id: "o2", label: "", mediaUrl: "" },
  ]);

  // auction
  const [prize, setPrize] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minBid, setMinBid] = useState(100);

  // common — per-instance unlock gate ("locked until X points") + app banner
  const [unlockThreshold, setUnlockThreshold] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  const toggleVideo = (id: string) =>
    setSelectedVideos((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const filteredVideos = AVAILABLE_VIDEOS.filter((v) =>
    v.title.toLowerCase().includes(videoSearch.toLowerCase()),
  );

  const addOption = () =>
    setOptions((o) => [...o, { id: `o_${Date.now()}`, label: "", mediaUrl: "" }]);
  const updateOption = (id: string, patch: Partial<PredictionOption>) =>
    setOptions((o) => o.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeOption = (id: string) => setOptions((o) => o.filter((it) => it.id !== id));

  const handleSave = () => {
    toast.success(`${cfg.title.replace("Create ", "")} created — saved as draft`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cfg.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name / question / title */}
          <div className="space-y-2">
            <Label>{cfg.nameLabel}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={cfg.namePh} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description…"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>App banner (widget)</Label>
            <BannerUpload value={banner} onChange={setBanner} aspect="aspect-[16/7]" />
          </div>

          {/* QUEST: videos + weeks */}
          {kind === "quest" && (
            <div className="space-y-3">
              <Label>Videos to watch ({selectedVideos.length} selected)</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  placeholder="Search videos to add…"
                  className="pl-9"
                />
              </div>
              <div className="border-border/40 max-h-44 space-y-1 overflow-y-auto rounded-lg border p-1">
                {filteredVideos.map((v) => {
                  const sel = selectedVideos.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVideo(v.id)}
                      className={cn(
                        "hover:bg-muted/40 flex w-full items-center gap-3 rounded-md p-2 text-left",
                        sel && "bg-accent/10",
                      )}>
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border",
                          sel ? "bg-accent border-accent text-accent-foreground" : "border-border",
                        )}>
                        {sel && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <Film className="text-muted-foreground h-4 w-4" />
                      <span className="flex-1 text-sm">{v.title}</span>
                      <span className="text-muted-foreground text-xs">{v.duration}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start date">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
                <Field label="Number of weeks">
                  <Select value={weeks} onValueChange={setWeeks}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4"].map((w) => (
                        <SelectItem key={w} value={w}>
                          {w} Week{w === "1" ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {/* PREDICTION: visual + options + cadence + entry cost + multiplier */}
          {kind === "prediction" && (
            <div className="space-y-3">
              <Field label="Visual element (trailer / video / photo URL)">
                <div className="relative">
                  <ImagePlus className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                  <Input
                    value={visualUrl}
                    onChange={(e) => setVisualUrl(e.target.value)}
                    placeholder="https://… (or upload later)"
                    className="pl-9"
                  />
                </div>
              </Field>

              <div className="space-y-2">
                <Label>Answer options</Label>
                {options.map((o, idx) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <Input
                      value={o.label}
                      onChange={(e) => updateOption(o.id, { label: e.target.value })}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1"
                    />
                    <Input
                      value={o.mediaUrl}
                      onChange={(e) => updateOption(o.id, { mediaUrl: e.target.value })}
                      placeholder="Image/video (optional)"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-9 w-9"
                      onClick={() => removeOption(o.id)}
                      disabled={options.length <= 2}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption} className="gap-2">
                  <Plus className="h-4 w-4" /> Add option
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Cadence">
                  <Select value={cadence} onValueChange={setCadence}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Entry cost (pts)">
                  <Input type="number" value={entryCost} onChange={(e) => setEntryCost(Number(e.target.value))} />
                </Field>
                <Field label="Correct multiplier">
                  <Select value={multiplier} onValueChange={setMultiplier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">×5</SelectItem>
                      <SelectItem value="10">×10</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Opens">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
            </div>
          )}

          {/* AUCTION: prize + window + min bid */}
          {kind === "auction" && (
            <div className="space-y-3">
              <Field label="Prize">
                <Input value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="e.g., 2 VIP premiere passes" />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Starts">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
                <Field label="Ends">
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Field>
                <Field label="Min bid (pts)">
                  <Input type="number" value={minBid} onChange={(e) => setMinBid(Number(e.target.value))} />
                </Field>
              </div>
            </div>
          )}

          {/* Unlock gate — per instance, all kinds ("locked until X points") */}
          <Field label="Unlock requirement (locked until X points)">
            <div className="flex items-center gap-2">
              <Lock className="text-muted-foreground h-4 w-4" />
              <Input
                type="number"
                value={unlockThreshold}
                onChange={(e) => setUnlockThreshold(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-muted-foreground text-xs">pts — 0 = open to everyone</span>
            </div>
          </Field>

          {/* Rewards (quest/prediction) */}
          {kind !== "auction" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Reward points">
                <Input type="number" value={rewardPoints} onChange={(e) => setRewardPoints(Number(e.target.value))} />
              </Field>
              <Field label="Reward XP">
                <Input type="number" value={rewardXp} onChange={(e) => setRewardXp(Number(e.target.value))} />
              </Field>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save as draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
