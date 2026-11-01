/*
 * UI demo build only: mock of the generated `AdminRegionsApi` — the country list from the app's
 * own `COUNTRIES`, in the API's shape. No request is ever sent.
 */
import type { CountryListItemDto } from "@/app/_libs/api/generated";
import { COUNTRIES, regionForCountry } from "@/app/_libs/regions";

import { ok } from "./_demo/core";

const CURRENCIES: Record<string, { code: string; name: string; symbol: string }> = {
  IN: { code: "INR", name: "Indian Rupee", symbol: "₹" },
  GB: { code: "GBP", name: "Pound Sterling", symbol: "£" },
  AE: { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  JP: { code: "JPY", name: "Japanese Yen", symbol: "¥" },
};
const EURO = { code: "EUR", name: "Euro", symbol: "€" };
const DOLLAR = { code: "USD", name: "US Dollar", symbol: "$" };

const countries: CountryListItemDto[] = [...COUNTRIES]
  .sort((a, b) => a.label.localeCompare(b.label))
  .map(({ code, label }) => {
    const region = regionForCountry(code);
    const currency = CURRENCIES[code] ?? (region === "EU" ? EURO : DOLLAR);
    return {
      code,
      name: label,
      region,
      currency: { ...currency, minorUnits: code === "JP" ? 0 : 2 },
      supported: true,
    } as CountryListItemDto;
  });

export const adminRegionsApi = {
  async adminRegionsControllerCountriesV1() {
    return ok(countries);
  },
};
