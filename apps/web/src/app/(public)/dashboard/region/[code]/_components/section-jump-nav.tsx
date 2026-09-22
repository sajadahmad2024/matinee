"use client";

// Anchor chips, NOT tabs: all seven boxes are always rendered and scrollable — the chips
// only jump. Implements the client's operating gesture ("jump to User Analytics").
export const REGION_BOXES = [
  { id: "user-analytics", title: "User Analytics" },
  { id: "gamification", title: "Gamification & Points Economy" },
  { id: "screen-time", title: "Screen Time & Session Quality" },
  { id: "monetization", title: "Monetization & Funnel" },
  { id: "community-in-app", title: "Community In-App" },
  { id: "community-external", title: "Community External" },
  { id: "graphs-trends", title: "Graphs & Trends" },
] as const;

export function SectionJumpNav() {
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <nav className="border-border/50 bg-background/85 sticky top-0 z-20 -mx-2 flex flex-wrap items-center gap-1.5 border-b px-2 py-2 backdrop-blur">
      {REGION_BOXES.map((b, i) => (
        <button
          key={b.id}
          type="button"
          onClick={() => jump(b.id)}
          className="border-border/60 bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
          <span className="bg-primary/15 text-primary flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold">
            {i + 1}
          </span>
          {b.title}
        </button>
      ))}
    </nav>
  );
}
