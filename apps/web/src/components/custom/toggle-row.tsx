"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface ToggleRowProps {
  label: React.ReactNode;
  /** One line under the label explaining what the switch does. */
  hint?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  /** The switch sits right after the label instead of at the row's far end. */
  inline?: boolean;
}

/** A settings row: label + hint on the left, a switch on the right (or beside the label). */
export function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
  id,
  disabled,
  inline,
}: ToggleRowProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;

  if (inline) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-3">
          <Label htmlFor={switchId}>{label}</Label>
          <Switch
            id={switchId}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
          />
        </div>
        {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={switchId}>{label}</Label>
        {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      </div>
      <Switch
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
