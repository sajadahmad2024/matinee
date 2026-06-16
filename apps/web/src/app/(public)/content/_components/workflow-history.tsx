import type { WorkflowEvent } from "../constants";

/** Workflow timeline for a piece of content (newest first) — accountability trail. */
export function WorkflowHistory({ events }: { events: WorkflowEvent[] }) {
  if (!events.length) {
    return <p className="text-muted-foreground text-xs">No workflow history yet.</p>;
  }

  return (
    <ol className="relative space-y-3 pl-4">
      <span className="bg-border/60 absolute top-1 bottom-1 left-[3px] w-px" />
      {events.map((e, i) => (
        <li key={`${e.date}-${i}`} className="relative">
          <span
            className={`absolute top-1 -left-4 h-2 w-2 rounded-full ${
              i === 0 ? "bg-success" : "bg-muted-foreground/50"
            }`}
          />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-muted-foreground text-xs tabular-nums">{e.date}</span>
            <span className="text-foreground text-sm">{e.label}</span>
            {e.by && <span className="text-muted-foreground text-xs">by {e.by}</span>}
          </div>
          {e.note && <p className="text-muted-foreground mt-0.5 text-xs">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}
