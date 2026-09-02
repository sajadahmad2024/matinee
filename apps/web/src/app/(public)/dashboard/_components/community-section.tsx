"use client";

import { Eye, Flame, MessageSquare, Reply, Share2, Smile, TrendingUp, Trophy } from "lucide-react";

import { fmtCount, fmtMoney, REGION_ANALYTICS, type CommunityData } from "../constants";
import { MetricTile } from "./metric-tile";

// In-app community (own data) + external social listening (GA / social — pending
// integration). Split into two exports so the region page can box them separately.
// Region-scoped via the `data` prop; defaults to the global baseline.

interface CommunityProps {
  data?: CommunityData;
}

export function CommunityInApp({ data = REGION_ANALYTICS["global"]!.community }: CommunityProps) {
  const d = data.inApp;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricTile label="Comments / user / week" value={String(d.commentsPerUserWeek)} sub="active participants vs passive" icon={MessageSquare} accent="text-primary" trend={{ direction: "up", label: "+0.2" }} />
      <MetricTile label="Reply rate" value={`${d.replyRatePct}%`} sub="conversations vs monologues" icon={Reply} accent="text-accent" trend={{ direction: "up", label: "+3%" }} />
      <MetricTile label="Reaction-to-view" value={`${d.reactionToViewPct}%`} sub="viewers who do anything" icon={Eye} accent="text-featured" trend={{ direction: "flat", label: "0%" }} />
      <MetricTile label="In-app shares / video" value={String(d.sharesPerVideo)} sub="sent to friends inside Matinee" icon={Share2} accent="text-success" trend={{ direction: "up", label: "+12%" }} />
    </div>
  );
}

export function CommunityExternal({ data = REGION_ANALYTICS["global"]!.community }: CommunityProps) {
  const d = data.external;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricTile label="Brand mentions / week" value={d.mentionsPerWeek.toLocaleString()} sub="X · TikTok · IG · Reddit · YT" icon={TrendingUp} accent="text-primary" pending="external" />
      <MetricTile label="Sentiment" value={d.sentiment.join(" / ")} sub="% pos / neutral / neg" icon={Smile} accent="text-success" pending="external" />
      <MetricTile label="Viral moments" value={String(d.viralMoments)} sub="mention spikes this month" icon={Flame} accent="text-destructive" pending="external" />
      <MetricTile label="Organic impressions" value={fmtCount(d.organicImpressions)} sub="free eyeballs from mentions" icon={Eye} accent="text-accent" pending="external" />
      <MetricTile label="Earned media value" value={fmtMoney(d.earnedMediaValue)} sub="ad-equivalent of impressions" icon={TrendingUp} accent="text-warning" pending="external" />
      <MetricTile label="Top advocates" value={String(d.topAdvocates)} sub="creators driving most reach" icon={Trophy} accent="text-featured" pending="external" />
    </div>
  );
}

/** Combined view (kept for any legacy callers). */
export function CommunitySection({ data }: CommunityProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">In-app community</p>
        <CommunityInApp data={data} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
          External (Google Analytics / social listening)
        </p>
        <CommunityExternal data={data} />
      </div>
    </div>
  );
}
