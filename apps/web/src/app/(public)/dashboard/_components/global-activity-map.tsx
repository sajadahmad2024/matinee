"use client";

import { useState } from "react";

import { cn } from "@/app/_libs/utils/cn";

interface CountryData {
  code: string;
  name: string;
  users: number;
  revenue: number;
  intensity: number; // 0-1
}

const countryData: CountryData[] = [
  { code: "US", name: "United States", users: 245000, revenue: 89000, intensity: 0.9 },
  { code: "IN", name: "India", users: 180000, revenue: 25000, intensity: 0.75 },
  { code: "JP", name: "Japan", users: 120000, revenue: 65000, intensity: 0.65 },
  { code: "KR", name: "South Korea", users: 95000, revenue: 48000, intensity: 0.55 },
  { code: "PH", name: "Philippines", users: 85000, revenue: 12000, intensity: 0.5 },
  { code: "ID", name: "Indonesia", users: 72000, revenue: 9500, intensity: 0.45 },
  { code: "TH", name: "Thailand", users: 58000, revenue: 8200, intensity: 0.38 },
  { code: "VN", name: "Vietnam", users: 45000, revenue: 5800, intensity: 0.3 },
  { code: "MY", name: "Malaysia", users: 38000, revenue: 7200, intensity: 0.25 },
  { code: "GB", name: "United Kingdom", users: 32000, revenue: 28000, intensity: 0.22 },
  { code: "AU", name: "Australia", users: 28000, revenue: 22000, intensity: 0.2 },
  { code: "DE", name: "Germany", users: 22000, revenue: 18000, intensity: 0.15 },
];

interface HoveredCountry {
  data: CountryData;
  x: number;
  y: number;
}

export function GlobalActivityMap() {
  const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(null);

  const getColor = (intensity: number) => {
    const alpha = 0.3 + intensity * 0.7;
    return `hsla(217, 91%, 60%, ${alpha})`;
  };

  return (
    <div className="relative h-[280px]">
      {/* Simplified Map Visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid w-full max-w-2xl grid-cols-6 gap-2 p-4">
          {countryData.map((country) => (
            <div
              key={country.code}
              className={cn(
                "relative cursor-pointer rounded-lg p-3 transition-all duration-200",
                "border-border hover:border-primary/50 border hover:scale-105",
              )}
              style={{ backgroundColor: getColor(country.intensity) }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredCountry({
                  data: country,
                  x: rect.left + rect.width / 2,
                  y: rect.top - 10,
                });
              }}
              onMouseLeave={() => setHoveredCountry(null)}>
              <div className="text-center">
                <span className="text-foreground text-xs font-bold">{country.code}</span>
                <div className="text-foreground-secondary mt-0.5 text-[10px]">
                  {(country.users / 1000).toFixed(0)}K
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="text-foreground-secondary absolute bottom-4 left-4 flex items-center gap-2 text-xs">
        <span>Low</span>
        <div className="flex gap-0.5">
          {[0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
            <div
              key={intensity}
              className="h-3 w-5 rounded-sm"
              style={{ backgroundColor: getColor(intensity) }}
            />
          ))}
        </div>
        <span>High</span>
      </div>

      {/* Tooltip */}
      {hoveredCountry && (
        <div
          className="glass-card animate-fade-in pointer-events-none fixed z-50 rounded-lg px-3 py-2 text-sm"
          style={{
            left: hoveredCountry.x,
            top: hoveredCountry.y,
            transform: "translate(-50%, -100%)",
          }}>
          <p className="text-foreground font-semibold">{hoveredCountry.data.name}</p>
          <div className="mt-1 flex items-center gap-4 text-xs">
            <span className="text-primary">{hoveredCountry.data.users.toLocaleString()} Users</span>
            <span className="text-success">
              ${hoveredCountry.data.revenue.toLocaleString()} Rev
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
