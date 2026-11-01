"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  type SharedContentSettingsValues,
  sharedContentSettingsSchema,
} from "@/app/_libs/schemas/games";

import { GAME_FORMATS } from "../../../_libs/game-config";
import { AppWidgetSection } from "../../../_shared/settings/app-widget-section";
import {
  type FormatSettingsData,
  FormatSettingsForm,
  FormatSettingsLoader,
  useSaveFormatSettings,
} from "../../../_shared/settings/format-settings-form";
import {
  toSharedContentRuleDto,
  toSharedContentSettingsValues,
} from "../_libs/shared-content-settings-mapper";
import { SharingRewardCard } from "./sharing-reward-card";

const FORMAT = GAME_FORMATS["shared-content"];

/**
 * Shared Content Settings tab — sharing rewards and app widget on one scrolling tab. The header's
 * Save submits it.
 */
export function SharedContentSettings() {
  return (
    <FormatSettingsLoader format={FORMAT}>
      {(data) => <SharedContentSettingsForm data={data} />}
    </FormatSettingsLoader>
  );
}

function SharedContentSettingsForm({ data }: { data: FormatSettingsData }) {
  const form = useForm<SharedContentSettingsValues>({
    resolver: zodResolver(sharedContentSettingsSchema),
    defaultValues: toSharedContentSettingsValues(data),
  });
  const save = useSaveFormatSettings(FORMAT);

  return (
    <FormatSettingsForm
      form={form}
      onSave={(values) =>
        save({
          rule: toSharedContentRuleDto(values),
          widget: values.widget,
        })
      }>
      <SharingRewardCard />
      <AppWidgetSection gameTypeName={FORMAT.name} />
    </FormatSettingsForm>
  );
}
