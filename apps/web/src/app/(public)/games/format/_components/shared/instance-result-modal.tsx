"use client";

import { useMemo, useState } from "react";

import { Award, CheckCircle2, Coins, Search, Users, XCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { GameInstance } from "./instances-list";

type ResultKind = "quest" | "prediction" | "auction";

interface Participant {
  name: string;
  /** their action: chosen option / bid amount / "2/3 videos" */
  detail: string;
  /** correct | incorrect | completed | in_progress | winning | outbid | refunded */
  result: string;
  points: number;
  when: string;
}

const NAMES = [
  "@cinephile_88", "@filmfan_22", "MovieBuff", "ReelDeal", "PopcornPete", "SceneQueen",
  "DirectorsCut", "FrameByFrame", "BingeKing", "TrailerTrish", "CriticChris", "FlickFan",
  "IndieIvy", "BlockbusterBob", "NoirNina",
];

const RESULT_BADGE: Record<string, string> = {
  correct: "bg-emerald-500/15 text-emerald-500",
  completed: "bg-emerald-500/15 text-emerald-500",
  winning: "bg-emerald-500/15 text-emerald-500",
  won: "bg-emerald-500/15 text-emerald-500",
  incorrect: "bg-destructive/15 text-destructive",
  in_progress: "bg-amber-500/15 text-amber-500",
  outbid: "bg-muted text-muted-foreground",
  refunded: "bg-blue-500/15 text-blue-500",
};

/** Deterministic mock participants so the table is populated (replace with API later). */
function buildParticipants(kind: ResultKind, instance: GameInstance): Participant[] {
  const n = Math.max(0, Math.min(NAMES.length, instance.status === "scheduled" || instance.status === "draft" ? 0 : 12));
  const live = instance.status === "active";
  return Array.from({ length: n }, (_, i) => {
    const name = NAMES[i] ?? `user_${i}`;
    if (kind === "prediction") {
      const correct = i % 3 === 0;
      return {
        name,
        detail: ["Character A", "Character B", "Character C"][i % 3]!,
        result: live ? "in_progress" : correct ? "correct" : "incorrect",
        points: !live && correct ? 500 : 0,
        when: `${i + 1}h ago`,
      };
    }
    if (kind === "auction") {
      const bid = 12400 - i * 850;
      const status = live ? (i === 0 ? "winning" : "outbid") : i === 0 ? "won" : "refunded";
      return { name, detail: `${bid.toLocaleString()} pts`, result: status, points: status === "won" ? -bid : 0, when: `${i * 12 + 5}m ago` };
    }
    // quest
    const done = i < 8;
    return {
      name,
      detail: done ? "3/3 videos" : `${(i % 3) + 1}/3 videos`,
      result: done ? "completed" : "in_progress",
      points: done ? 100 : 0,
      when: done ? `${i + 1}h ago` : "—",
    };
  });
}

interface InstanceResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: GameInstance | null;
  kind: ResultKind;
}

export function InstanceResultModal({ open, onOpenChange, instance, kind }: InstanceResultModalProps) {
  const [query, setQuery] = useState("");
  const participants = useMemo(
    () => (instance ? buildParticipants(kind, instance) : []),
    [instance, kind],
  );

  if (!instance) return null;
  const isLive = instance.status === "active";
  const filtered = participants.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const detailHead = kind === "auction" ? "Bid" : kind === "prediction" ? "Pick" : "Progress";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {instance.name}
            <Badge variant="secondary" className="capitalize">
              {instance.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto pr-1">
          <p className="text-muted-foreground text-sm">{instance.schedule}</p>

          {/* outcome + stats */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="border-border/50 bg-muted/20 rounded-lg border p-4 sm:col-span-2">
              <Outcome kind={kind} instance={instance} isLive={isLive} />
            </div>
            <Stat icon={<Users className="h-4 w-4" />} label="Participants" value={instance.participants.toLocaleString()} />
            <Stat
              icon={<Coins className="h-4 w-4" />}
              label="Points distributed"
              value={(instance.pointsDistributed ?? 0).toLocaleString()}
            />
          </div>

          {/* participants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground text-sm font-semibold">
                Participants{" "}
                <span className="text-muted-foreground font-normal">
                  ({instance.participants.toLocaleString()})
                </span>
              </h4>
              <div className="relative w-56">
                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search players…"
                  className="h-9 pl-9"
                />
              </div>
            </div>

            <div className="border-border/40 max-h-[42vh] overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0">
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>{detailHead}</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                        No participants yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {p.name.replace("@", "").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.detail}</TableCell>
                        <TableCell>
                          <Badge className={`${RESULT_BADGE[p.result] ?? "bg-muted"} border-0 text-[10px] capitalize`}>
                            {p.result.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {p.points > 0 ? `+${p.points.toLocaleString()}` : p.points < 0 ? p.points.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right text-xs">{p.when}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Outcome({
  kind,
  instance,
  isLive,
}: {
  kind: ResultKind;
  instance: GameInstance;
  isLive: boolean;
}) {
  if (kind === "auction") {
    return (
      <OutcomeRow
        icon={<Award className="text-amber-500 h-5 w-5" />}
        title={isLive ? "Top bidder" : "Winner"}
        value={instance.winner ?? "—"}
        sub={instance.outcome ?? ""}
      />
    );
  }
  if (kind === "prediction") {
    return (
      <OutcomeRow
        icon={isLive ? <XCircle className="text-amber-500 h-5 w-5" /> : <CheckCircle2 className="text-emerald-500 h-5 w-5" />}
        title={isLive ? "Awaiting outcome" : "Correct answer"}
        value={instance.outcome ?? (isLive ? "In progress" : "—")}
        sub={instance.winner ? `${instance.winner} got it right` : ""}
      />
    );
  }
  return (
    <OutcomeRow
      icon={<CheckCircle2 className="text-emerald-500 h-5 w-5" />}
      title="Completions"
      value={`${(instance.completions ?? 0).toLocaleString()} / ${instance.participants.toLocaleString()}`}
      sub={
        instance.participants
          ? `${Math.round(((instance.completions ?? 0) / instance.participants) * 100)}% completion`
          : ""
      }
    />
  );
}

function OutcomeRow({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-muted-foreground text-xs">{title}</p>
        <p className="text-foreground text-lg font-semibold">{value}</p>
        {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border-border/40 rounded-lg border p-3">
      <div className="text-muted-foreground flex items-center gap-1 text-xs">
        {icon}
        {label}
      </div>
      <p className="text-foreground mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
