"use client";

import { useQuery } from "@tanstack/react-query";

import { adminRegionsApi } from "@/app/_libs/api/sdk/admin-regions-api";
import { REGIONS_QUERY_KEYS } from "@/app/_libs/query/query-keys";

export type { CountryListItemDto } from "@/app/_libs/api/generated";

/** Every country (ISO alpha-2 code, name, macro-region, currency), ordered by name. Reference data. */
export const useCountries = () => {
  const query = useQuery({
    queryKey: REGIONS_QUERY_KEYS.countries(),
    queryFn: () => adminRegionsApi.adminRegionsControllerCountriesV1(),
    staleTime: Infinity,
  });

  return { countriesQuery: query, countries: query?.data?.data ?? [] };
};
