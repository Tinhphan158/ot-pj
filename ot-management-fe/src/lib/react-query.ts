import { QueryClient } from '@tanstack/react-query';

/**
 * Global defaults. NOTE: refetchOnMount is false, so any cross-page cache
 * invalidation that must update an inactive query needs refetchType: 'all'.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
