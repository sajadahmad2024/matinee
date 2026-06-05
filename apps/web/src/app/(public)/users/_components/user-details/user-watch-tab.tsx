"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { DetailItem } from "./detail-item";

const genreData = [
  { name: "Action", value: 60, color: "hsl(var(--accent))" },
  { name: "Comedy", value: 25, color: "hsl(var(--success))" },
  { name: "Drama", value: 15, color: "hsl(var(--warning))" },
];

const watchHistory = [
  { title: "Avengers: Endgame", watched: "2 hours ago", duration: "45 min" },
  { title: "The Batman Returns", watched: "Yesterday", duration: "32 min" },
  { title: "Dune: Part Two", watched: "2 days ago", duration: "1h 20min" },
];

export function UserWatchTab() {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Genre Pie */}
        <Card className="border-border/50 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Favorite Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ChartContainer config={{ value: { label: "%" } }} className="h-[150px] w-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value">
                      {genreData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="space-y-2">
                {genreData.map((g) => (
                  <div key={g.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                    <span className="text-foreground-secondary text-sm">{g.name}</span>
                    <span className="font-mono text-sm">{g.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watch Stats */}
        <Card className="border-border/50 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Engagement Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Avg. Session" value="42 mins" valueClassName="font-mono" />
            <DetailItem
              label="Completion Rate"
              value="78%"
              valueClassName="text-success font-mono"
            />
            <DetailItem label="Videos Watched" value="234" valueClassName="font-mono" />
          </CardContent>
        </Card>
      </div>

      {/* Watch History */}
      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recently Watched</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {watchHistory.map((item, i) => (
                <TableRow key={i} className="border-border/30">
                  <TableCell className="text-foreground">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.watched}</TableCell>
                  <TableCell className="text-foreground text-right">{item.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
