'use client';

import { useQuery } from '@tanstack/react-query';
import { userKeys, userService } from '@/shared/api';

/** Everyone in the company, by name. */
export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: userService.findAll,
    staleTime: 5 * 60_000,
  });
}
