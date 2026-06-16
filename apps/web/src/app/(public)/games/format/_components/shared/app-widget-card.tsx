"use client";

import { useState } from "react";

import { LayoutGrid } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { GlassCard } from "../../../_components/glass-card";
import { BannerUpload } from "./banner-upload";

interface AppWidgetCardProps {
  gameTypeName: string;
  defaultCta?: string;
}

/**
 * How this game type appears as a WIDGET in the customer app: banner, CTA, widget
 * style and visibility. (Per-instance games also get their own banner in the create form.)
 */
export function AppWidgetCard({ gameTypeName, defaultCta = "Play now" }: AppWidgetCardProps) {
  const [banner, setBanner] = useState<string | null>(null);
  const [cta, setCta] = useState(defaultCta);
  const [style, setStyle] = useState("card");
  const [accent, setAccent] = useState("#7c3aed");
  const [visible, setVisible] = useState(true);

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="text-accent h-4 w-4" /> App Widget
        </CardTitle>
        <CardDescription>How {gameTypeName} appears in the customer app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Banner</Label>
          <BannerUpload value={banner} onChange={setBanner} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Call-to-action</Label>
            <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Play now" />
          </div>
          <div className="space-y-2">
            <Label>Widget style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="accent" className="shrink-0">
              Accent
            </Label>
            <input
              id="accent"
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="border-border/50 h-8 w-12 cursor-pointer rounded border bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="widget-visible">Visible in app</Label>
            <Switch id="widget-visible" checked={visible} onCheckedChange={setVisible} />
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
