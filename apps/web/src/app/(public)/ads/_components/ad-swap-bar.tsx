"use client";

import { ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { MacroRegion } from "@/app/_libs/regions";
import { CustomButton } from "@/components/custom/custom-button";

import { rankIn } from "../_libs/ad-config";
import type { AdCampaignDto } from "../_libs/ad-types";

interface AdSwapBarProps {
  picked: AdCampaignDto[];
  region: MacroRegion;
  regionLabel: string;
  onClear: () => void;
  onSwap: () => void;
  isPending?: boolean;
}

/**
 * Shown once an ad is ticked: prompts for the second pick, then offers the swap. Clashes with a
 * third ad are checked by the backend when the swap is sent.
 */
export function AdSwapBar({
  picked,
  region,
  regionLabel,
  onClear,
  onSwap,
  isPending,
}: AdSwapBarProps) {
  const [first, second] = picked;
  if (!first) return null;

  return (
    <div className="border-border bg-muted/40 flex flex-col gap-2 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center">
      <p className="flex-1">
        {second ? (
          <>
            Swap “{first?.name}” (#{rankIn(first, region)}) and “{second?.name}” (#
            {rankIn(second, region)}) in {regionLabel}.
          </>
        ) : (
          <>
            Pick one more ad to swap ranks with “{first?.name}” in {regionLabel}.
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
        <CustomButton
          size="sm"
          disabled={!second}
          isLoading={isPending}
          leftIcon={<ArrowLeftRight className="h-4 w-4" />}
          onClick={onSwap}>
          Swap ranks
        </CustomButton>
      </div>
    </div>
  );
}
