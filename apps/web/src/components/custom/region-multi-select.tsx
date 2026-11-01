"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";

/** `"all"` = every region (the backend sends this as an empty `regions` array). */
export type RegionSelection = "all" | MacroRegion[];

export interface RegionMultiSelectProps {
  value: RegionSelection;
  onChange: (value: RegionSelection) => void;
  /** Prefix for the checkbox ids, so two selects can share a page. */
  idPrefix?: string;
  disabled?: boolean;
  className?: string;
}

/** The regions a selection covers: all five for `"all"`. */
export const selectedRegions = (value: RegionSelection): MacroRegion[] =>
  value === "all" ? MACRO_REGIONS.map((r) => r.code) : value;

/**
 * "All regions" + one checkbox per macro-region. Ticking "All regions" disables the others;
 * unticking it starts from an empty selection.
 */
export function RegionMultiSelect({
  value,
  onChange,
  idPrefix = "region",
  disabled,
  className,
}: RegionMultiSelectProps) {
  const isAll = value === "all";

  const toggle = (code: MacroRegion) => {
    const list = isAll ? [] : value;
    onChange(list.includes(code) ? list.filter((r) => r !== code) : [...list, code]);
  };

  return (
    <div className={cn("flex flex-wrap gap-x-5 gap-y-2", className)}>
      <RegionCheckbox
        id={`${idPrefix}-all`}
        label="All regions"
        checked={isAll}
        disabled={disabled}
        onChange={() => onChange(isAll ? [] : "all")}
      />
      {MACRO_REGIONS.map((r) => (
        <RegionCheckbox
          key={r.code}
          id={`${idPrefix}-${r.code}`}
          label={r.label}
          checked={isAll || value.includes(r.code)}
          disabled={disabled || isAll}
          onChange={() => toggle(r.code)}
        />
      ))}
    </div>
  );
}

function RegionCheckbox({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
