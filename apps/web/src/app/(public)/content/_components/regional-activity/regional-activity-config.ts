import type { ContentRegionStatDto, ContentStatsDto } from "@/app/_libs/api/generated";
import { ALL_REGIONS, MACRO_REGIONS } from "@/app/_libs/regions";
import type { RegionBoxMetric, RegionBoxOption } from "@/components/custom/region-box-filter";

/** Region grid boxes: "All regions" plus each macro-region. */
export const CONTENT_REGION_OPTIONS: RegionBoxOption[] = [
  { code: ALL_REGIONS, label: "All regions" },
  ...MACRO_REGIONS.map((r) => ({ code: r.code, label: r.label })),
];

/**
 * Map modes from `GET /admin/content/stats` → `byRegion` (always all five regions, never scoped
 * by `?region=`). "Live videos" is `published` — published and available there; the API's `live`
 * counts any status with the region switched on. Views and watch time are by viewer region over
 * the last 30 days, so "All" sums them; a video is live in several regions, so "All" for live
 * videos is the library-wide published count instead.
 */
export const buildContentRegionMetrics = (stats?: ContentStatsDto): RegionBoxMetric[] => {
  const regions = stats?.byRegion ?? [];
  const valuesOf = (pick: (r: ContentRegionStatDto) => number, all: number) => ({
    [ALL_REGIONS]: all,
    ...Object.fromEntries(regions?.map((r) => [r?.region, pick(r)])),
  });
  const sumOf = (pick: (r: ContentRegionStatDto) => number) =>
    regions?.reduce((total, r) => total + pick(r), 0);

  const published = (r: ContentRegionStatDto) => r?.published ?? 0;
  const views = (r: ContentRegionStatDto) => r?.views30d ?? 0;
  const watchHours = (r: ContentRegionStatDto) => Math.round((r?.watchSeconds30d ?? 0) / 3600);

  return [
    {
      key: "live",
      label: "Live videos",
      hue: 217,
      values: valuesOf(published, stats?.activeLibrary ?? 0),
    },
    { key: "views", label: "Views", hue: 270, values: valuesOf(views, sumOf(views)) },
    {
      key: "watch",
      label: "Watch hours",
      hue: 142,
      values: valuesOf(watchHours, sumOf(watchHours)),
    },
  ];
};
