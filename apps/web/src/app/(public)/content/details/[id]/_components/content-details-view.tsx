import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  ExternalLink,
  FileText,
  Film,
  Gavel,
  Globe,
  ImageIcon,
  type LucideIcon,
  Pencil,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DetailRow } from "@/components/custom/detail-row";
import { GlassCard } from "@/components/custom/glass-card";

import { ChangeHistoryCard } from "../../../_components/change-history-card";
import { ContentStatusBadge } from "../../../_components/content-status-badge";
import { MOCK_CONTENT_HISTORY, type VideoItem } from "../../../constants";

// Same steps as the add/edit wizard, so a section reads the same in both places.
const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "details", label: "Details", icon: FileText },
  { key: "rights", label: "Rights", icon: Gavel },
  { key: "media", label: "Media", icon: Film },
  { key: "distribution", label: "Distribution", icon: Globe },
  { key: "ad-sales", label: "Ad Sales", icon: DollarSign },
];

const LICENSE_STATUS_LABEL: Record<NonNullable<VideoItem["licenseStatus"]>, string> = {
  original: "Original / owned",
  licensed: "Licensed",
  expiring: "Licensed — expiring",
  expired: "Licensed — expired",
};

const RECOMMENDATION_LABEL: Record<NonNullable<VideoItem["recommendation"]>, string> = {
  promoted: "Promoted",
  normal: "Normal",
  deprioritized: "Deprioritized",
};

const EMPTY = "—";

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString(undefined, { dateStyle: "medium" }) : EMPTY;

function Chips({ items }: { items?: string[] }) {
  if (!items?.length) return <>{EMPTY}</>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function DetailsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>{children}</dl>
      </CardContent>
    </GlassCard>
  );
}

/** Read-only view of a video, one wizard step per tab. Editing happens at /content/edit/[id]. */
export function ContentDetailsView({ video }: { video: VideoItem }) {
  const isOriginal = !video.licenseStatus || video.licenseStatus === "original";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to content">
            <Link href={"/content" as Route}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-gaming text-foreground text-2xl font-bold">{video.title}</h1>
              <ContentStatusBadge status={video.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              {video.studioName} · {video.duration}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/content/analytics/${video.id}` as Route}>
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link href={`/content/edit/${video.id}` as Route}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="bg-background-secondary h-auto flex-wrap p-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="cursor-pointer gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="details">
          <DetailsSection title="Video Details">
            <DetailRow label="Title">{video.title}</DetailRow>
            <DetailRow label="Studio">{video.studioName}</DetailRow>
            <DetailRow label="Genres">
              <Chips items={video.genres} />
            </DetailRow>
            <DetailRow label="Language">{video.language ?? EMPTY}</DetailRow>
            <DetailRow label="Uploaded">{fmtDate(video.uploadDate)}</DetailRow>
            <DetailRow label="Where to watch">
              {video.watchLinks?.length ? (
                <ul className="space-y-1">
                  {video.watchLinks.map((link) => (
                    <li key={link.platform}>
                      {link.url ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary inline-flex items-center gap-1 hover:underline">
                          {link.platform}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        link.platform
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                EMPTY
              )}
            </DetailRow>
          </DetailsSection>
        </TabsContent>

        <TabsContent value="rights">
          <DetailsSection title="Licensing & Rights">
            <DetailRow label="License type">
              {LICENSE_STATUS_LABEL[video.licenseStatus ?? "original"]}
            </DetailRow>
            {!isOriginal && (
              <>
                <DetailRow label="Licensor">{video.licensorName ?? EMPTY}</DetailRow>
                <DetailRow label="Expires in">
                  {video.licenseExpiresInDays !== undefined
                    ? `${video.licenseExpiresInDays} days`
                    : EMPTY}
                </DetailRow>
                <DetailRow label="Terms">{video.licenseTerms ?? EMPTY}</DetailRow>
              </>
            )}
          </DetailsSection>
        </TabsContent>

        <TabsContent value="media">
          <DetailsSection title="Media Files">
            <DetailRow label="Thumbnail">
              <div className="border-border bg-background-tertiary relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                {video.thumbnail ? (
                  <Image
                    src={video.thumbnail}
                    alt={`${video.title} thumbnail`}
                    fill
                    unoptimized
                    sizes="384px"
                    className="object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-xs">
                    <ImageIcon className="h-6 w-6" />
                    No thumbnail
                  </div>
                )}
              </div>
            </DetailRow>
            <DetailRow label="Duration">{video.duration}</DetailRow>
          </DetailsSection>
        </TabsContent>

        <TabsContent value="distribution">
          <DetailsSection title="Distribution">
            <DetailRow label="Region">{video.region ?? EMPTY}</DetailRow>
            <DetailRow label="Live window">
              {video.liveFrom || video.liveUntil
                ? `${fmtDate(video.liveFrom)} → ${fmtDate(video.liveUntil)}`
                : EMPTY}
            </DetailRow>
            <DetailRow label="Scheduled for">{video.scheduledAt ?? EMPTY}</DetailRow>
            <DetailRow label="Recommendation">
              {video.recommendation ? RECOMMENDATION_LABEL[video.recommendation] : EMPTY}
            </DetailRow>
            <DetailRow label="Featured">{video.isFeatured ? "Yes" : "No"}</DetailRow>
            <DetailRow label="Boosted">{video.boosted ? "Yes" : "No"}</DetailRow>
            <DetailRow label="Linked games">{video.linkedGames}</DetailRow>
          </DetailsSection>
        </TabsContent>

        <TabsContent value="ad-sales">
          <DetailsSection title="Ad Sales">
            <DetailRow label="Format">
              {video.sponsored ? "Sponsored — sponsor logo overlay" : "Organic — no sponsor"}
            </DetailRow>
            {video.sponsored && (
              <>
                <DetailRow label="Sponsor / Brand">{video.sponsor ?? EMPTY}</DetailRow>
                <DetailRow label="Overlay duration">
                  {video.adOverlayDays ? `${video.adOverlayDays} days` : EMPTY}
                </DetailRow>
              </>
            )}
          </DetailsSection>
        </TabsContent>
      </Tabs>

      <ChangeHistoryCard history={MOCK_CONTENT_HISTORY} />
    </div>
  );
}
