"use client";

import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { GlassCard } from "../../../games/_components/glass-card";

interface VideoDetailsCardProps {
  title: string;
  setTitle: (val: string) => void;
  studioName: string;
  setStudioName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  genre: string;
  setGenre: (val: string) => void;
  tags: string;
  setTags: (val: string) => void;
  cast: string[];
  newCast: string;
  setNewCast: (val: string) => void;
  onAddCast: () => void;
  onRemoveCast: (index: number) => void;
}

export function VideoDetailsCard({
  title,
  setTitle,
  studioName,
  setStudioName,
  description,
  setDescription,
  genre,
  setGenre,
  tags,
  setTags,
  cast,
  newCast,
  setNewCast,
  onAddCast,
  onRemoveCast,
}: VideoDetailsCardProps) {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground">Video Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studio">Studio Name</Label>
            <Input
              id="studio"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              placeholder="Production studio"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your video..."
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
                <SelectItem value="documentary">Documentary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="action, drama, thriller"
            />
          </div>
        </div>

        {/* Cast */}
        <div className="space-y-2">
          <Label>Cast / Actors</Label>
          <div className="mb-2 flex flex-wrap gap-2">
            {cast.map((actor, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {actor}
                <button
                  type="button"
                  onClick={() => onRemoveCast(index)}
                  className="hover:text-destructive ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCast}
              onChange={(e) => setNewCast(e.target.value)}
              placeholder="Add actor name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddCast();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={onAddCast}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
