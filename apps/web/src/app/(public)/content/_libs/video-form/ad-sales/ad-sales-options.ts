import { SponsorshipFormat } from "@/app/_libs/schemas";
import type { CustomSelectOption } from "@/components/custom/custom-select";

/** Ad Sales step dropdowns. */

// Feed video ads aren't set here — they're Ads Management campaigns (/ads, spec-07).
export const SPONSORSHIP_FORMAT_OPTIONS: CustomSelectOption<SponsorshipFormat>[] = [
  { value: SponsorshipFormat.Organic, label: "Organic — no sponsor" },
  { value: SponsorshipFormat.Sponsored, label: "Sponsored — sponsor logo overlay" },
];
