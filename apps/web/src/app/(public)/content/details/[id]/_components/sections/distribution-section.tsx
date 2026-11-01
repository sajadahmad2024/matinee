import * as React from "react";

import Link from "next/link";

import { Gamepad2, Globe, Rocket } from "lucide-react";

import type { LinkedGamesDto, RegionsResponseDto } from "@/app/_libs/api/generated";
import type { ContentResponseDto } from "@/app/_libs/hooks/api/use-admin-content";
import { DetailRow } from "@/components/custom/detail-row";

import { BOOST_CHANNELS } from "../../../../_libs/video-form/boost/boost-options";
import {
  CONTENT_TYPES,
  LANGUAGE_OPTIONS,
  RECOMMENDATION_OPTIONS,
  RIGHTS_REGION_OPTIONS,
  regionLabel,
} from "../../../../_libs/video-form/distribution/distribution-options";
import { CONTENT_ROUTES } from "../../../../_shared/content-config";
import {
  EMPTY,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatGoLive,
} from "../../../../_shared/content-format";
import { DetailChips, DetailsCard } from "../details-card";
import { DETAILS_COPY } from "../details-config";

export interface DistributionSectionProps {
  content: ContentResponseDto;
  regions: RegionsResponseDto;
  linkedGames: LinkedGamesDto;
}

const labelOf = (options: { value: string; label: React.ReactNode }[], value?: string | null) =>
  (value && options.find((option) => option.value === value)?.label) || value || EMPTY;

const GAME_GROUPS = [
  { key: "predictions", label: "Predictions" },
  { key: "auctions", label: "Auctions" },
  { key: "quests", label: "Quests" },
] as const;

/**
 * Wizard step 4: classification (type, parent, access, language, rights, recommendation), where
 * it's published, its dates, boost, and the games linked to it.
 */
export const DistributionSection: React.FC<DistributionSectionProps> = ({
  content,
  regions,
  linkedGames,
}) => {
  const contentType = CONTENT_TYPES[content?.contentType as keyof typeof CONTENT_TYPES];
  const isExclusive = content?.accessTier === "exclusive";

  return (
    <div className="space-y-6">
      <DetailsCard title="Distribution" icon={Globe}>
        <DetailRow label="Content type">{contentType?.label ?? content?.contentType}</DetailRow>
        {content?.parentContentId && (
          <DetailRow label="Belongs to">
            <Link
              href={CONTENT_ROUTES.details(content.parentContentId)}
              className="text-primary hover:underline">
              View primary title
            </Link>
          </DetailRow>
        )}
        <DetailRow label="Access">
          {isExclusive ? `Exclusive · ${content?.unlockPoints ?? 0} points to unlock` : "Free"}
        </DetailRow>
        <DetailRow label="Language">{labelOf(LANGUAGE_OPTIONS, content?.language)}</DetailRow>
        <DetailRow label="Rights region">
          {labelOf(RIGHTS_REGION_OPTIONS, content?.rightsRegion)}
        </DetailRow>
        <DetailRow label="Publish regions">
          <DetailChips
            items={regions?.items?.map((item) => ({
              key: item.region,
              highlight: item.live,
              label: `${regionLabel(item.region)} · ${item.live ? "Live" : "Off"}`,
            }))}
          />
        </DetailRow>
        <DetailRow label="Recommendation">
          {labelOf(RECOMMENDATION_OPTIONS, content?.recommendation)}
        </DetailRow>
        <DetailRow label="Scheduled for">{formatGoLive(content?.scheduledAt)}</DetailRow>
        <DetailRow label="Published">{formatDateTime(content?.publishedAt)}</DetailRow>
        <DetailRow label="Available until">{formatDate(content?.availableUntil)}</DetailRow>
      </DetailsCard>

      <DetailsCard title="Boost" icon={Rocket}>
        <DetailRow label="Status">
          {content?.isBoostActive
            ? "Active"
            : content?.isBoosted
              ? "Set, not running"
              : "Not boosted"}
        </DetailRow>
        {content?.isBoosted && (
          <>
            <DetailRow label="Priority">{content?.boostPriority ?? EMPTY}</DetailRow>
            <DetailRow label="Window">
              {formatDateRange(content?.boostStartsAt, content?.boostedUntil)}
            </DetailRow>
            <DetailRow label="Channels">
              <DetailChips
                items={content?.boostChannels?.map((channel) => ({
                  key: channel,
                  label: BOOST_CHANNELS[channel]?.label ?? channel,
                }))}
              />
            </DetailRow>
          </>
        )}
      </DetailsCard>

      <DetailsCard title={`Linked Games (${linkedGames?.total ?? 0})`} icon={Gamepad2}>
        {linkedGames?.total ? (
          GAME_GROUPS.map(({ key, label }) => (
            <DetailRow key={key} label={label}>
              <DetailChips
                items={linkedGames?.[key]?.map((game) => ({
                  key: game.id,
                  label: `${game.title} · ${game.status}`,
                }))}
              />
            </DetailRow>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">{DETAILS_COPY.noLinkedGames}</p>
        )}
      </DetailsCard>
    </div>
  );
};

DistributionSection.displayName = "DistributionSection";
