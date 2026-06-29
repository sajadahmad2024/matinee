// Region model: country (ISO or display name) → macro-region. Dashboards roll countries
// up into macro-regions with a country drill-down. Mirrors backend users.country_code.

export type MacroRegion = "NA" | "EU" | "APAC" | "LATAM" | "MEA";

export const MACRO_REGIONS: { code: MacroRegion; label: string }[] = [
  { code: "NA", label: "North America" },
  { code: "EU", label: "Europe" },
  { code: "APAC", label: "Asia-Pacific" },
  { code: "LATAM", label: "Latin America" },
  { code: "MEA", label: "Middle East & Africa" },
];

const REGION_LABEL: Record<MacroRegion, string> = MACRO_REGIONS.reduce(
  (acc, r) => ({ ...acc, [r.code]: r.label }),
  {} as Record<MacroRegion, string>,
);

// Country drill-down for the app-wide ?country= filter (ISO alpha-2 → display name).
export const COUNTRIES: { code: string; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "IN", label: "India" },
  { code: "JP", label: "Japan" },
  { code: "AU", label: "Australia" },
  { code: "KR", label: "South Korea" },
  { code: "SG", label: "Singapore" },
  { code: "ID", label: "Indonesia" },
  { code: "BR", label: "Brazil" },
  { code: "MX", label: "Mexico" },
  { code: "AR", label: "Argentina" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "ZA", label: "South Africa" },
  { code: "NG", label: "Nigeria" },
  { code: "EG", label: "Egypt" },
];

// country (display name OR ISO alpha-2) → macro-region
const COUNTRY_TO_REGION: Record<string, MacroRegion> = {
  // North America
  USA: "NA", US: "NA", "United States": "NA", Canada: "NA", CA: "NA",
  // Europe
  UK: "EU", GB: "EU", "United Kingdom": "EU", Germany: "EU", DE: "EU",
  France: "EU", FR: "EU", Spain: "EU", ES: "EU", Italy: "EU", IT: "EU",
  // Asia-Pacific
  India: "APAC", IN: "APAC", Japan: "APAC", JP: "APAC", Australia: "APAC", AU: "APAC",
  "South Korea": "APAC", KR: "APAC", Singapore: "APAC", SG: "APAC", Indonesia: "APAC", ID: "APAC",
  // Latin America
  Brazil: "LATAM", BR: "LATAM", Mexico: "LATAM", MX: "LATAM", Argentina: "LATAM", AR: "LATAM",
  // Middle East & Africa
  UAE: "MEA", AE: "MEA", "South Africa": "MEA", ZA: "MEA", Nigeria: "MEA", NG: "MEA", Egypt: "MEA", EG: "MEA",
};

/** Map a country (name or ISO) to its macro-region; defaults to APAC for unknowns. */
export function regionForCountry(country?: string | null): MacroRegion {
  if (!country) return "APAC";
  return COUNTRY_TO_REGION[country] ?? COUNTRY_TO_REGION[country.toUpperCase()] ?? "APAC";
}

export function regionLabel(code: MacroRegion): string {
  return REGION_LABEL[code];
}
