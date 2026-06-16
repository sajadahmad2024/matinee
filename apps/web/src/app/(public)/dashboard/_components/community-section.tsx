"use client";

import { Eye, Flame, MessageSquare, Reply, Share2, Smile, TrendingUp, Trophy } from "lucide-react";

import { MetricTile } from "./metric-tile";

// In-app community (own data) + external social listening (GA / social — pending integration).
export function CommunitySection() {
  return (
    <div className="space-y-4">
      {/* In-app */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">In-app community</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Comments / user / week" value="1.8" sub="active participants vs passive" icon={MessageSquare} accent="text-primary" trend={{ direction: "up", label: "+0.2" }} />
          <MetricTile label="Reply rate" value="42%" sub="comments that get a reply" icon={Reply} accent="text-accent" trend={{ direction: "up", label: "+3%" }} />
          <MetricTile label="Reaction-to-view" value="7.8%" sub="viewers who do anything" icon={Eye} accent="text-featured" trend={{ direction: "flat", label: "0%" }} />
          <MetricTile label="In-app shares / video" value="184" sub="sent to friends inside Matinee" icon={Share2} accent="text-success" trend={{ direction: "up", label: "+12%" }} />
        </div>
      </div>

      {/* External */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
          External (Google Analytics / social listening)
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricTile label="Brand mentions / week" value="2,340" sub="X · TikTok · IG · Reddit · YT" icon={TrendingUp} accent="text-primary" pending="external" />
          <MetricTile label="Sentiment" value="68 / 22 / 10" sub="% pos / neutral / neg" icon={Smile} accent="text-success" pending="external" />
          <MetricTile label="Viral moments" value="3" sub="mention spikes this month" icon={Flame} accent="text-destructive" pending="external" />
          <MetricTile label="Organic impressions" value="14.2M" sub="free eyeballs from mentions" icon={Eye} accent="text-accent" pending="external" />
          <MetricTile label="Earned media value" value="$182K" sub="ad-equivalent of impressions" icon={TrendingUp} accent="text-warning" pending="external" />
          <MetricTile label="Top advocates" value="12" sub="creators driving most reach" icon={Trophy} accent="text-featured" pending="external" />
        </div>
      </div>
    </div>
  );
}
