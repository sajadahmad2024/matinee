"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, BarChart3, Pencil } from "lucide-react";

import type { ContentResponseDto } from "@/app/_libs/hooks/api/use-admin-content";
import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";

import { formatDuration, toBadgeStatus } from "../../../_components/listing/listing-config";
import { CONTENT_TYPES } from "../../../_libs/video-form/distribution/distribution-options";
import {
  CONTENT_ROUTES,
  ContentLifecycleStatus,
  hasAnalytics,
} from "../../../_shared/content-config";
import { EMPTY } from "../../../_shared/content-format";
import { ContentStatusBadge } from "../../../_shared/content-status-badge";
import { DETAILS_COPY } from "./details-config";

export interface ContentDetailsHeaderProps {
  content: ContentResponseDto;
  className?: string;
}

/** Back link, title + status, the meta line, and Analytics / Edit. */
export const ContentDetailsHeader: React.FC<ContentDetailsHeaderProps> = ({
  content,
  className,
}) => {
  const router = useRouter();
  const contentType =
    CONTENT_TYPES[content?.contentType as keyof typeof CONTENT_TYPES]?.label ??
    content?.contentType;
  const meta = [content?.studioName, contentType, formatDuration(content?.durationSeconds)].filter(
    (part) => part && part !== EMPTY,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}>
      <div className="flex min-w-0 flex-col gap-1">
        <Link
          href={CONTENT_ROUTES.LIST}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {DETAILS_COPY.backLabel}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-gaming text-foreground text-2xl font-bold break-words">
            {content?.title}
          </h1>
          <ContentStatusBadge status={toBadgeStatus(content?.status)} />
        </div>
        {meta.length > 0 && <p className="text-muted-foreground text-sm">{meta.join(" · ")}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {hasAnalytics(content?.status) && (
          <CustomButton
            variant="outline"
            size="sm"
            leftIcon={<BarChart3 className="h-4 w-4" />}
            onClick={() => router.push(CONTENT_ROUTES.analytics(content?.id))}>
            Analytics
          </CustomButton>
        )}
        {content?.status !== ContentLifecycleStatus.Archived && (
          <CustomButton
            size="sm"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(CONTENT_ROUTES.edit(content?.id))}>
            Edit
          </CustomButton>
        )}
      </div>
    </div>
  );
};

ContentDetailsHeader.displayName = "ContentDetailsHeader";
