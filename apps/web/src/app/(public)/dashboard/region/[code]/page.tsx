"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { ArrowLeft, MapPinOff } from "lucide-react";

import { Button } from "@/components/ui/button";

import { downloadCsv, type CsvRow } from "../../_libs/download-csv";
import { fmtDuration, getRegionAnalytics, type RegionAnalytics } from "../../constants";
import { BoxCommunityExternal } from "./_components/box-community-external";
import { BoxCommunityInApp } from "./_components/box-community-in-app";
import { BoxGamificationEconomy } from "./_components/box-gamification-economy";
import { BoxGraphsTrends } from "./_components/box-graphs-trends";
import { BoxMonetizationFunnel } from "./_components/box-monetization-funnel";
import { BoxScreenTime } from "./_components/box-screen-time";
import { BoxUserAnalytics } from "./_components/box-user-analytics";
import { RegionHeader } from "./_components/region-header";
import { SectionJumpNav } from "./_components/section-jump-nav";

// Per-region drill-down: region strip + sticky jump chips + seven boxed sections on one
// scrollable page. `code` accepts an ISO country (US, GB, …), a macro-region (NA, EU,
// APAC, LATAM, MEA), or "global".

// CSV of every metric in all 7 boxes (section, metric, value, trend).
function regionCsvRows(a: RegionAnalytics): CsvRow[] {
  const u = a.userAnalytics;
  const g = a.gamification;
  const s = a.screenTime;
  const m = a.monetization;
  const c = a.community;
  const gr = a.graphs;
  const rows: CsvRow[] = [["Section", "Metric", "Value", "Trend"]];
  const push = (section: string, metric: string, value: string | number, trend = "") =>
    rows.push([section, metric, value, trend]);

  push("Main statistics", "Users", a.strip.users);
  push("Main statistics", "Subscribers", a.strip.subscribers);
  push("Main statistics", "Online now", a.strip.onlineNow);
  push("Main statistics", "Playing now", a.strip.playingNow);

  push("1. User Analytics", "Video starts", u.starts, "+3.2%");
  push("1. User Analytics", "Video completes", u.completes);
  push("1. User Analytics", "Completion ratio", `${Math.round((u.completes / u.starts) * 100)}%`);
  push("1. User Analytics", "Avg watch %", `${u.avgWatchPct}%`, "+1.4%");
  push("1. User Analytics", "Swipe-through rate", `${u.swipeThroughPct}%`, "-0.9%");
  push("1. User Analytics", "Re-watches / loops", `${u.rewatchLoops}x`, "+0.2x");
  push("1. User Analytics", "Engagement / session", u.engagementPerSession, "+0.5");
  push("1. User Analytics", "Videos / session", u.videosPerSession, "+1.1");
  push("1. User Analytics", "Videos / day per user", u.videosPerDay);
  push("1. User Analytics", "Completion rate (live library)", `${u.completionLivePct}%`);
  push("1. User Analytics", "Hit rate (new uploads)", `${u.hitRatePct}%`, "+4%");

  push("2. Gamification & Points Economy", "Points earned / user / day", g.earnedPerUserDay, "+6%");
  push("2. Gamification & Points Economy", "Redemption rate", `${g.redemptionPct}%`);
  push("2. Gamification & Points Economy", "Points outstanding", g.pointsOutstanding);
  push("2. Gamification & Points Economy", "Avg streak (days)", g.streakAvgDays);
  push("2. Gamification & Points Economy", "Longest streak (days)", g.streakLongestDays);
  push("2. Gamification & Points Economy", "Leaderboard checks / user / week", g.leaderboardChecksPerWeek);
  push("2. Gamification & Points Economy", "Avg rank change / week", g.rankChangeAvgWeek);
  push("2. Gamification & Points Economy", "Challenge participation", `${g.challengeParticipationPct}%`);
  push("2. Gamification & Points Economy", "Challenge completion", `${g.challengeCompletionPct}%`);
  for (const src of g.earnedBySource)
    push("2. Gamification & Points Economy", `Earned by source — ${src.name}`, `${src.value}%`);

  push("3. Screen Time & Session Quality", "Viewers (passive)", s.viewers);
  push("3. Screen Time & Session Quality", "Viewers with gamification", s.gamified);
  push("3. Screen Time & Session Quality", "Avg session length", fmtDuration(s.sessionAvgSecs));
  push("3. Screen Time & Session Quality", "Median session length", fmtDuration(s.sessionMedianSecs));
  for (const b of s.sessionBuckets)
    push("3. Screen Time & Session Quality", `Session length ${b.bucket}`, `${b.pct}%`);
  push("3. Screen Time & Session Quality", "BG-FG transitions / session", s.bgFgPerSession);
  push("3. Screen Time & Session Quality", "Doomscroll depth (videos)", s.doomscrollVideos);
  push("3. Screen Time & Session Quality", "Doomscroll depth (minutes)", s.doomscrollMinutes);

  push("4. Monetization & Funnel", "ARPU", `$${m.arpu.toFixed(2)}`, "+4%");
  push("4. Monetization & Funnel", "ARPDAU", `$${m.arpdau.toFixed(2)}`);
  push("4. Monetization & Funnel", "Trial to paid", `${m.trialToPaidPct}%`, "+2%");
  push("4. Monetization & Funnel", "LTV:CAC (blended)", `${m.ltvCacRatio}x`);
  push("4. Monetization & Funnel", "Funnel — signups", m.funnel.signups);
  push("4. Monetization & Funnel", "Funnel — first session", m.funnel.firstSession);
  push("4. Monetization & Funnel", "Funnel — engaged", m.funnel.engaged);
  push("4. Monetization & Funnel", "Funnel — subscribed", m.funnel.subscribed);
  push("4. Monetization & Funnel", "Funnel — via referral", m.funnel.referred);
  for (const ch of m.channels)
    push("4. Monetization & Funnel", `LTV/CAC — ${ch.channel}`, `$${ch.ltv} / $${ch.cac}`);

  push("5. Community In-App", "Comments / user / week", c.inApp.commentsPerUserWeek, "+0.2");
  push("5. Community In-App", "Reply rate", `${c.inApp.replyRatePct}%`, "+3%");
  push("5. Community In-App", "Reaction-to-view", `${c.inApp.reactionToViewPct}%`);
  push("5. Community In-App", "In-app shares / video", c.inApp.sharesPerVideo, "+12%");

  push("6. Community External", "Brand mentions / week", c.external.mentionsPerWeek, "pending external");
  push("6. Community External", "Sentiment pos/neutral/neg", c.external.sentiment.join(" / "), "pending external");
  push("6. Community External", "Viral moments", c.external.viralMoments, "pending external");
  push("6. Community External", "Organic impressions", c.external.organicImpressions, "pending external");
  push("6. Community External", "Earned media value", `$${c.external.earnedMediaValue.toLocaleString()}`, "pending external");
  push("6. Community External", "Top advocates", c.external.topAdvocates, "pending external");

  push("7. Graphs & Trends", "Retention D1", `${gr.retention.d1}%`);
  push("7. Graphs & Trends", "Retention D7", `${gr.retention.d7}%`);
  push("7. Graphs & Trends", "Retention D30", `${gr.retention.d30}%`);
  push("7. Graphs & Trends", "K-factor (latest)", gr.kFactor[gr.kFactor.length - 1]!.k);
  for (const v of gr.velocity) push("7. Graphs & Trends", `Daily active players — ${v.day}`, v.players);

  return rows;
}

export default function RegionAnalyticsPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? "30d";

  const code = decodeURIComponent(params.code ?? "");
  const analytics = getRegionAnalytics(code);

  // Unknown code → friendly fallback (pattern: games' unknown-type card).
  if (!analytics) {
    return (
      <div className="animate-fade-in flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <MapPinOff className="text-muted-foreground h-10 w-10" />
        <div>
          <h1 className="text-foreground text-xl font-semibold">Unknown region</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            “{code}” isn’t a tracked country or macro-region. Pick a region from the activity map.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const exportReport = () =>
    downloadCsv(`analytics-${analytics.code}-${timeRange}.csv`, regionCsvRows(analytics));

  return (
    <div className="animate-fade-in space-y-6">
      <RegionHeader analytics={analytics} timeRange={timeRange} onExport={exportReport} />
      <SectionJumpNav />
      <BoxUserAnalytics analytics={analytics} />
      <BoxGamificationEconomy analytics={analytics} />
      <BoxScreenTime analytics={analytics} />
      <BoxMonetizationFunnel analytics={analytics} />
      <BoxCommunityInApp analytics={analytics} />
      <BoxCommunityExternal analytics={analytics} />
      <BoxGraphsTrends analytics={analytics} />
    </div>
  );
}
