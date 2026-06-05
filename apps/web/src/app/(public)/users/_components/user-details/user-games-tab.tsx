"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const winLossData = [
  { month: "Oct", wins: 12, losses: 8 },
  { month: "Nov", wins: 18, losses: 6 },
  { month: "Dec", wins: 15, losses: 10 },
  { month: "Jan", wins: 22, losses: 5 },
];

const gameHistory = [
  { game: "Weekly Contest", date: "Today", result: "Won", xp: 150 },
  { game: "Predict Outcome", date: "Yesterday", result: "Lost", xp: 25 },
  { game: "Watch Streak", date: "2 days ago", result: "Completed", xp: 200 },
];

export function UserGamesTab() {
  return (
    <div className="mt-4 space-y-4">
      {/* Win/Loss Chart */}
      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="text-accent h-4 w-4" />
            Win/Loss Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              wins: { label: "Wins", color: "hsl(var(--success))" },
              losses: { label: "Losses", color: "hsl(var(--destructive))" },
            }}
            className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winLossData}>
                <XAxis dataKey="month" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="wins" fill="hsl(var(--success))" radius={4} />
                <Bar dataKey="losses" fill="hsl(var(--destructive))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Game History */}
      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground">Game</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Result</TableHead>
                <TableHead className="text-muted-foreground text-right">XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameHistory.map((g, i) => (
                <TableRow key={i} className="border-border/30">
                  <TableCell className="text-foreground">{g.game}</TableCell>
                  <TableCell className="text-muted-foreground">{g.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        g.result === "Won"
                          ? "bg-success/10 text-success"
                          : g.result === "Lost"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                      }>
                      {g.result}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-success text-right font-mono">+{g.xp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
