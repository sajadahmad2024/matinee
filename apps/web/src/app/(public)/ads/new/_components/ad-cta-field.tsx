"use client";

import { useState } from "react";

import { ListChecks, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AD_LIMITS } from "@/app/_libs/schemas/ads";
import { CustomField } from "@/components/custom/custom-field";
import { CustomInput } from "@/components/custom/custom-input";
import { CustomSelect } from "@/components/custom/custom-select";

import { CTA_LABELS } from "../../_libs/ad-config";

const CTA_OPTIONS = CTA_LABELS.map((label) => ({ value: label, label }));

/** One of the fixed labels; anything else is the admin's own text (backend: any text ≤ 40 chars). */
const isPreset = (label?: string | null) => CTA_LABELS.some((preset) => preset === label);

interface AdCtaFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

/**
 * The ad's button label: one of the preset labels, or — via the button under it — the admin's own
 * text (max 40 chars). An ad saved with its own label opens in custom mode with that text.
 */
export function AdCtaField({ value, onChange, onBlur, error }: AdCtaFieldProps) {
  const [custom, setCustom] = useState(() => !!value && !isPreset(value));
  // focus the text box only after the admin switches to it — not when an edit opens on a custom label
  const [focusCustom, setFocusCustom] = useState(false);

  const toggle = () => {
    // into custom: start from the current preset so it can be edited; back: the first preset
    if (!custom) {
      setCustom(true);
      setFocusCustom(true);
    } else {
      setCustom(false);
      if (!isPreset(value)) onChange(CTA_LABELS[0]);
    }
  };

  return (
    <CustomField label="Button" error={error}>
      {custom ? (
        <CustomInput
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          maxLength={AD_LIMITS.ctaLabelMax}
          placeholder="e.g. Book a test drive"
          aria-label="Custom button label"
          autoFocus={focusCustom}
        />
      ) : (
        <CustomSelect
          options={CTA_OPTIONS}
          value={isPreset(value) ? value : undefined}
          onValueChange={onChange}
          triggerClassName="w-full"
          aria-label="Button label"
        />
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggle}
        className="w-full cursor-pointer gap-1.5 text-xs">
        {/* `size-*`, not h/w: the Button sizes every svg without a `size-` class to size-4 */}
        {custom ? <ListChecks className="size-3.5" /> : <PenLine className="size-3.5" />}
        {custom ? "Use a preset" : "Custom label"}
      </Button>
    </CustomField>
  );
}
