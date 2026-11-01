"use client";

import { LayoutGrid } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { type GameWidgetValues, WIDGET_STYLES } from "@/app/_libs/schemas/games";
import { BannerUpload } from "@/components/custom/banner-upload";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

const STYLE_LABELS: Record<(typeof WIDGET_STYLES)[number], string> = {
  card: "Card",
  hero: "Hero",
  carousel: "Carousel",
};

const STYLE_OPTIONS = WIDGET_STYLES?.map((value) => ({ value, label: STYLE_LABELS[value] }));

/**
 * How a format appears as a widget in the customer app: banner, CTA, style, accent, visibility.
 * A section of the format's settings form (`widget.*`).
 */
export function AppWidgetSection({ gameTypeName }: { gameTypeName: string }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<{ widget: GameWidgetValues }>();

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="text-accent h-4 w-4" /> App Widget
        </CardTitle>
        <CardDescription>How {gameTypeName} appears in the customer app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomField label="Banner">
          <Controller
            control={control}
            name="widget.bannerUrl"
            render={({ field }) => <BannerUpload value={field.value} onChange={field.onChange} />}
          />
        </CustomField>

        <div className="grid grid-cols-2 gap-4">
          <CustomField
            label="Call-to-action"
            htmlFor="widget-cta"
            error={errors?.widget?.ctaLabel?.message}>
            <Input id="widget-cta" placeholder="Play now" {...register("widget.ctaLabel")} />
          </CustomField>
          <CustomField label="Widget style">
            {/* own wrapper: Radix adds a hidden <select> beside the trigger */}
            <div>
              <Controller
                control={control}
                name="widget.style"
                render={({ field }) => (
                  <CustomSelect
                    options={STYLE_OPTIONS}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-label="Widget style"
                  />
                )}
              />
            </div>
          </CustomField>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="accent" className="shrink-0">
              Accent
            </Label>
            <input
              id="accent"
              type="color"
              {...register("widget.accent")}
              className="border-border/50 h-8 w-12 cursor-pointer rounded border bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="widget-visible">Visible in app</Label>
            <Controller
              control={control}
              name="widget.visible"
              render={({ field }) => (
                <Switch
                  id="widget-visible"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
