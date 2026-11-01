import { type DefaultOptions, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

const isDev = process.env.NODE_ENV === "development";

/**
 * Admin data changes rarely under the user's feet, so cache for 5 minutes and let mutations
 * invalidate explicitly. No retries: a failed admin call should surface immediately rather
 * than spin, and 4xx responses will not succeed on retry anyway.
 */
const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,
  },
  mutations: {
    retry: false,
  },
};

export const createQueryClient = (overrides?: DefaultOptions) =>
  new QueryClient({
    defaultOptions: {
      ...queryConfig,
      ...overrides,
      queries: { ...queryConfig.queries, ...overrides?.queries },
      mutations: { ...queryConfig.mutations, ...overrides?.mutations },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isDev) console.error("[query]", query.queryKey, error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (isDev) console.error("[mutation]", mutation.options.mutationKey ?? "", error);
      },
    }),
  });
