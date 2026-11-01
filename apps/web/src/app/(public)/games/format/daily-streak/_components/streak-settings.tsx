"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  type DailyStreakSettingsValues,
  dailyStreakSettingsSchema,
} from "@/app/_libs/schemas/games";

import { GAME_FORMATS } from "../../../_libs/game-config";
import { AppWidgetSection } from "../../../_shared/settings/app-widget-section";
import {
  type FormatSettingsData,
  FormatSettingsForm,
  FormatSettingsLoader,
  useSaveFormatSettings,
} from "../../../_shared/settings/format-settings-form";
import { toStreakRuleDto, toStreakSettingsValues } from "../_libs/streak-settings-mapper";
import { StreakEarningCard } from "./streak-earning-card";

const FORMAT = GAME_FORMATS["daily-streak"];

/**
 * Daily Streak Settings tab — earning rules and app widget on one scrolling tab. The header's Save
 * submits it.
 */
export function StreakSettings() {
  return (
    <FormatSettingsLoader format={FORMAT}>
      {(data) => <StreakSettingsForm data={data} />}
    </FormatSettingsLoader>
  );
}

function StreakSettingsForm({ data }: { data: FormatSettingsData }) {
  const form = useForm<DailyStreakSettingsValues>({
    resolver: zodResolver(dailyStreakSettingsSchema),
    defaultValues: toStreakSettingsValues(data),
  });
  const save = useSaveFormatSettings(FORMAT);

  return (
    <FormatSettingsForm
      form={form}
      onSave={(values) =>
        save({
          rule: toStreakRuleDto(values),
          widget: values.widget,
        })
      }>
      <StreakEarningCard />
      <AppWidgetSection gameTypeName={FORMAT.name} />
    </FormatSettingsForm>
  );
}
