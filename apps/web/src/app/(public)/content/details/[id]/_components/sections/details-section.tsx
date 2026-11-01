import * as React from "react";

import { ExternalLink, FileText, Star } from "lucide-react";

import type { ContentResponseDto } from "@/app/_libs/hooks/api/use-admin-content";
import { DetailRow } from "@/components/custom/detail-row";

import { CAST_ROLE_LABELS } from "../../../../_libs/video-form/details/details-options";
import { EMPTY } from "../../../../_shared/content-format";
import { DetailChips, DetailsCard } from "../details-card";
import { DETAILS_COPY } from "../details-config";

export interface DetailsSectionProps {
  content: ContentResponseDto;
}

/** Wizard step 1: description, studio, genres (primary starred), tags, cast & crew, where to watch. */
export const DetailsSection: React.FC<DetailsSectionProps> = ({ content }) => {
  const cast = [...(content?.cast ?? [])].sort((a, b) => a.billingOrder - b.billingOrder);

  return (
    <DetailsCard title="Video Details" icon={FileText}>
      <DetailRow label="Title">{content?.title}</DetailRow>
      <DetailRow label="Description">
        <p className="whitespace-pre-line">{content?.description || DETAILS_COPY.noDescription}</p>
      </DetailRow>
      <DetailRow label="Studio">{content?.studioName ?? EMPTY}</DetailRow>
      <DetailRow label="Genres">
        <DetailChips
          items={content?.genres?.map((genre) => ({
            key: genre.id,
            highlight: genre.isPrimary,
            label: (
              <span className="inline-flex items-center gap-1">
                {genre.isPrimary && <Star className="h-3 w-3 fill-current" />}
                {genre.name}
              </span>
            ),
          }))}
        />
      </DetailRow>
      <DetailRow label="Tags">
        <DetailChips items={content?.tags?.map((tag) => ({ key: tag.id, label: tag.name }))} />
      </DetailRow>
      <DetailRow label="Cast & crew">
        {cast.length ? (
          <ul className="space-y-1">
            {cast.map((member) => (
              <li key={member.personId} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-foreground font-medium">{member.name}</span>
                <span className="text-muted-foreground text-xs">
                  {CAST_ROLE_LABELS[member.role] ?? member.role}
                  {member.characterName && ` · as ${member.characterName}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          DETAILS_COPY.noCast
        )}
      </DetailRow>
      <DetailRow label="Where to watch">
        {content?.watchLinks?.length ? (
          <ul className="space-y-1">
            {content.watchLinks.map((link) => (
              <li key={`${link.platform}-${link.url}`}>
                {link.url ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 hover:underline">
                    {link.label || link.platform}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  link.label || link.platform
                )}
              </li>
            ))}
          </ul>
        ) : (
          EMPTY
        )}
      </DetailRow>
    </DetailsCard>
  );
};

DetailsSection.displayName = "DetailsSection";
