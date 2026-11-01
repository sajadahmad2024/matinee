import { LicenseDtoRenewalStatusEnum } from "@/app/_libs/api/generated";
import { LicenseKind } from "@/app/_libs/schemas";
import type { CustomSelectOption } from "@/components/custom/custom-select";

/**
 * Rights step dropdowns. Lists with a backend enum are built from it, with labels typed `Record<Enum, string>`,
 * so a new backend value fails the type check until it gets a label.
 */

export const LICENSE_KIND_OPTIONS: CustomSelectOption<LicenseKind>[] = [
  { value: LicenseKind.Original, label: "Original / owned" },
  { value: LicenseKind.Licensed, label: "Licensed" },
];

const RENEWAL_LABELS: Record<LicenseDtoRenewalStatusEnum, string> = {
  [LicenseDtoRenewalStatusEnum.Renewing]: "Renewing",
  [LicenseDtoRenewalStatusEnum.InNegotiation]: "In negotiation",
  [LicenseDtoRenewalStatusEnum.Expiring]: "Expiring (not renewing)",
  [LicenseDtoRenewalStatusEnum.AutoRenew]: "Auto-renew",
  [LicenseDtoRenewalStatusEnum.Lapsed]: "Lapsed",
};

export const RENEWAL_OPTIONS: CustomSelectOption<LicenseDtoRenewalStatusEnum>[] = Object.values(
  LicenseDtoRenewalStatusEnum,
).map((value) => ({ value, label: RENEWAL_LABELS[value] }));

// TODO: load currencies from the backend once it exposes them (the API takes any 3-letter code today).
export const CURRENCY_OPTIONS: CustomSelectOption[] = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "BRL",
  "AED",
].map((code) => ({ value: code, label: code }));
