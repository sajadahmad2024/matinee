"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { day: "Mon", players: 42500 },
  { day: "Tue", players: 38200 },
  { day: "Wed", players: 45800 },
  { day: "Thu", players: 41200 },
  { day: "Fri", players: 52400 },
  { day: "Sat", players: 68500 },
  { day: "Sun", players: 72100 },
];

export function GameplayVelocityChart() {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(270, 91%, 65%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(217, 33%, 14%)",
              border: "1px solid hsl(217, 33%, 22%)",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "hsl(210, 40%, 96%)" }}
            formatter={(value: number) => [value.toLocaleString(), "Daily Active Players"]}
            cursor={{ fill: "hsl(217, 33%, 17%)" }}
          />
          <Bar dataKey="players" fill="url(#colorPlayers)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
