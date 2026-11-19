import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

/**
 * Global defaults. refetchOnMount is true (the library default): a query only
 * refetches on mount when it is stale, so invalidations can stay at the default
 * refetchType ('active') — inactive queries are just marked stale and reload
 * when they are shown again. Do NOT invalidate with refetchType: 'all': it
 * refetches every cached range (each visited day/week/month) at once and trips
 * the API rate limit (429).
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        // Retrying a rate-limited request only makes the limit worse.
        retry: (failureCount, error) =>
          failureCount < 1 && !(error instanceof AxiosError && error.response?.status === 429),
      },
    },
  });
}
