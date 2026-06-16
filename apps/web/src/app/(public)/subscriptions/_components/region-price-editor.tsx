"use client";

import { Globe } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

export interface RegionPrice {
  region: MacroRegion;
  amount: number;
  currency: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "BRL", "AED"];

interface RegionPriceEditorProps {
  value: RegionPrice[];
  basePrice: number;
  baseCurrency: string;
  onChange: (prices: RegionPrice[]) => void;
}

/**
 * Per-region price overrides for a plan. A region left at the base price inherits the default;
 * an explicit amount overrides it (with its own currency).
 */
export function RegionPriceEditor({ value, basePrice, baseCurrency, onChange }: RegionPriceEditorProps) {
  const byRegion = new Map(value.map((p) => [p.region, p]));

  const setRegion = (region: MacroRegion, patch: Partial<RegionPrice>) => {
    const current = byRegion.get(region) ?? { region, amount: basePrice, currency: baseCurrency };
    const next = { ...current, ...patch };
    const rest = value.filter((p) => p.region !== region);
    onChange([...rest, next]);
  };

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground grid grid-cols-12 gap-2 px-1 text-[11px]">
        <span className="col-span-5">Region</span>
        <span className="col-span-4">Price</span>
        <span className="col-span-3">Currency</span>
      </div>
      {MACRO_REGIONS.map((r) => {
        const override = byRegion.get(r.code);
        return (
          <div key={r.code} className="grid grid-cols-12 items-center gap-2">
            <div className="text-foreground col-span-5 flex items-center gap-1.5 text-sm">
              <Globe className="text-muted-foreground h-3.5 w-3.5" />
              {r.label}
            </div>
            <Input
              type="number"
              min={0}
              step="0.01"
              className="col-span-4 h-9"
              placeholder={`${basePrice} (base)`}
              value={override?.amount ?? ""}
              onChange={(e) =>
                setRegion(r.code, { amount: e.target.value === "" ? basePrice : Number(e.target.value) })
              }
            />
            <Select
              value={override?.currency ?? baseCurrency}
              onValueChange={(v) => setRegion(r.code, { currency: v })}>
              <SelectTrigger className="col-span-3 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
      <p className="text-muted-foreground text-[11px]">
        Leave a region blank to inherit the base price. Overrides apply to subscribers in that region.
      </p>
    </div>
  );
}
